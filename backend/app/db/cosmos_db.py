import os
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from dotenv import load_dotenv
import logging
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Azure Cosmos DB configuration
COSMOS_ENDPOINT = os.getenv("AZURE_COSMOS_DB_ENDPOINT")
COSMOS_KEY = os.getenv("AZURE_COSMOS_DB_KEY")
DATABASE_NAME = os.getenv("AZURE_COSMOS_DB_DATABASE", "fan_events")

# Container names
USERS_CONTAINER = "users"
ARTISTS_CONTAINER = "artists"
FAN_PREFERENCES_CONTAINER = "fan_preferences"
EVENT_CACHE_CONTAINER = "event_cache"


class CosmosDB:
    def __init__(self):
        self.client = None
        self.database = None
        self.containers = {}
        self.initialized = False

    def initialize(self):
        """Initialize the Cosmos DB client and create database and containers if they don't exist."""
        if not COSMOS_ENDPOINT or not COSMOS_KEY:
            logger.warning("Cosmos DB credentials not provided. Using mock database.")
            self.initialized = False
            return

        try:
            # Initialize Cosmos client
            self.client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)

            # Create database if it doesn't exist
            self.database = self.client.create_database_if_not_exists(id=DATABASE_NAME)
            logger.info(f"Database '{DATABASE_NAME}' initialized")

            # Create all required containers
            self._create_container_if_not_exists(USERS_CONTAINER, "/id")
            self._create_container_if_not_exists(ARTISTS_CONTAINER, "/id")
            self._create_container_if_not_exists(FAN_PREFERENCES_CONTAINER, "/id")
            self._create_container_if_not_exists(EVENT_CACHE_CONTAINER, "/id")

            self.initialized = True
            logger.info("Cosmos DB initialization completed successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Cosmos DB: {str(e)}")
            self.initialized = False

    def _create_container_if_not_exists(
        self, container_id, partition_key_path, default_ttl=None
    ):
        """Create a container if it doesn't exist."""
        try:
            container_params = {
                "id": container_id,
                "partition_key": PartitionKey(path=partition_key_path),
            }

            if default_ttl is not None:
                container_params["default_time_to_live"] = default_ttl

            container = self.database.create_container_if_not_exists(**container_params)
            self.containers[container_id] = container
            logger.info(f"Container '{container_id}' created or already exists")
            return container
        except exceptions.CosmosHttpResponseError as e:
            logger.error(f"Failed to create container '{container_id}': {str(e)}")
            # 이미 존재하는 컨테이너인 경우 가져오기 시도
            try:
                container = self.database.get_container_client(container_id)
                self.containers[container_id] = container
                logger.info(f"Retrieved existing container '{container_id}'")
                return container
            except Exception as inner_e:
                logger.error(
                    f"Failed to retrieve container '{container_id}': {str(inner_e)}"
                )
                return None

    def get_container(self, container_id):
        """Get a container by ID. Create it if it doesn't exist."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return None

        if container_id not in self.containers:
            logger.info(f"Container '{container_id}' not in cache, creating it...")
            return self._create_container_if_not_exists(container_id, "/id")

        return self.containers.get(container_id)

    async def get_collection(self, collection_name):
        """
        Get a collection by name (alias for get_container).
        This method is added for compatibility with the database.py interface.
        """
        logger.info(f"Getting collection '{collection_name}'")
        return self.get_container(collection_name)

    # User operations
    async def create_user(self, user_data):
        """Create a new user."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return user_data

        container = self.get_container(USERS_CONTAINER)
        if not container:
            logger.error(f"Container '{USERS_CONTAINER}' not available")
            return user_data

        # Add document type to distinguish between different entities
        user_data["type"] = "user"
        # Ensure id field exists
        if "id" not in user_data:
            user_data["id"] = user_data.get(
                "userId", str(hash(user_data.get("email", "")))
            )

        # datetime 객체를 문자열로 변환
        if "createdAt" in user_data and isinstance(user_data["createdAt"], datetime):
            user_data["createdAt"] = user_data["createdAt"].isoformat()
        if "updatedAt" in user_data and isinstance(user_data["updatedAt"], datetime):
            user_data["updatedAt"] = user_data["updatedAt"].isoformat()

        return container.create_item(body=user_data)

    async def get_user(self, user_id):
        """Get a user by ID."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return None

        container = self.get_container(USERS_CONTAINER)
        if not container:
            return None

        query = f"SELECT * FROM c WHERE c.userId = '{user_id}' AND c.type = 'user'"
        items = list(
            container.query_items(query=query, enable_cross_partition_query=True)
        )
        return items[0] if items else None

    async def get_all_users(self):
        """Get all users."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return []

        container = self.get_container(USERS_CONTAINER)
        if not container:
            return []

        query = "SELECT * FROM c WHERE c.type = 'user'"
        return list(
            container.query_items(query=query, enable_cross_partition_query=True)
        )

    async def update_user(self, user_id, user_data):
        """Update a user."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return user_data

        container = self.get_container(USERS_CONTAINER)
        if not container:
            return user_data

        user = await self.get_user(user_id)
        if user:
            user.update(user_data)
            return container.replace_item(item=user["id"], body=user)
        return None

    # Artist operations
    async def create_artist(self, artist_data):
        """Create a new artist."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return artist_data

        container = self.get_container(ARTISTS_CONTAINER)
        if not container:
            return artist_data

        # Add document type to distinguish between different entities
        artist_data["type"] = "artist"
        # Ensure id field exists
        if "id" not in artist_data:
            artist_data["id"] = artist_data.get(
                "artistId", str(hash(artist_data.get("name", "")))
            )

        return container.create_item(body=artist_data)

    async def get_artist(self, artist_id):
        """Get an artist by ID."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return None

        container = self.get_container(ARTISTS_CONTAINER)
        if not container:
            return None

        query = (
            f"SELECT * FROM c WHERE c.artistId = '{artist_id}' AND c.type = 'artist'"
        )
        items = list(
            container.query_items(query=query, enable_cross_partition_query=True)
        )
        return items[0] if items else None

    async def get_all_artists(self):
        """Get all artists."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return []

        container = self.get_container(ARTISTS_CONTAINER)
        if not container:
            return []

        query = "SELECT * FROM c WHERE c.type = 'artist'"
        return list(
            container.query_items(query=query, enable_cross_partition_query=True)
        )

    async def update_artist(self, artist_id, artist_data):
        """Update an artist."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return artist_data

        container = self.get_container(ARTISTS_CONTAINER)
        if not container:
            return artist_data

        artist = await self.get_artist(artist_id)
        if artist:
            artist.update(artist_data)
            return container.replace_item(item=artist["id"], body=artist)
        return None

    # Fan Preference operations
    async def create_fan_preference(self, preference_data):
        """Create a new fan preference."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return preference_data

        container = self.get_container(FAN_PREFERENCES_CONTAINER)
        if not container:
            return preference_data

        # Add document type to distinguish between different entities
        preference_data["type"] = "fan_preference"
        # Ensure id field exists
        if "id" not in preference_data:
            preference_data["id"] = preference_data.get(
                "preferenceId",
                str(
                    hash(
                        f"{preference_data.get('userId', '')}-{preference_data.get('artistId', '')}"
                    )
                ),
            )

        return container.create_item(body=preference_data)

    async def get_fan_preference(self, preference_id):
        """Get a fan preference by ID."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return None

        container = self.get_container(FAN_PREFERENCES_CONTAINER)
        if not container:
            return None

        query = f"SELECT * FROM c WHERE c.preferenceId = '{preference_id}' AND c.type = 'fan_preference'"
        items = list(
            container.query_items(query=query, enable_cross_partition_query=True)
        )
        return items[0] if items else None

    async def get_fan_preferences_by_artist(self, artist_id):
        """Get all fan preferences for an artist."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return []

        container = self.get_container(FAN_PREFERENCES_CONTAINER)
        if not container:
            return []

        query = f"SELECT * FROM c WHERE c.artistId = '{artist_id}' AND c.type = 'fan_preference'"
        return list(
            container.query_items(query=query, enable_cross_partition_query=True)
        )

    async def get_fan_preferences_by_user(self, user_id):
        """Get all fan preferences for a user."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return []

        container = self.get_container(FAN_PREFERENCES_CONTAINER)
        if not container:
            return []

        query = f"SELECT * FROM c WHERE c.userId = '{user_id}' AND c.type = 'fan_preference'"
        return list(
            container.query_items(query=query, enable_cross_partition_query=True)
        )

    async def update_fan_preference(self, artist_id, user_id, preference_data):
        """Update a fan preference."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return preference_data

        container = self.get_container(FAN_PREFERENCES_CONTAINER)
        if not container:
            return preference_data

        query = f"SELECT * FROM c WHERE c.artistId = '{artist_id}' AND c.userId = '{user_id}' AND c.type = 'fan_preference'"
        items = list(
            container.query_items(query=query, enable_cross_partition_query=True)
        )

        if items:
            item = items[0]
            item.update(preference_data)
            return container.replace_item(item=item["id"], body=item)
        return None

    # Event Cache operations
    async def create_event_cache(self, event_data):
        """Create a new event cache."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return event_data

        container = self.get_container(EVENT_CACHE_CONTAINER)
        if not container:
            return event_data

        # Add document type to distinguish between different entities
        event_data["type"] = "event_cache"
        # Ensure id field exists
        if "id" not in event_data:
            event_data["id"] = event_data.get(
                "eventId", str(hash(event_data.get("name", "")))
            )

        return container.create_item(body=event_data)

    async def get_event_cache(self, event_id):
        """Get an event cache by ID."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return None

        container = self.get_container(EVENT_CACHE_CONTAINER)
        if not container:
            return None

        query = (
            f"SELECT * FROM c WHERE c.eventId = '{event_id}' AND c.type = 'event_cache'"
        )
        items = list(
            container.query_items(query=query, enable_cross_partition_query=True)
        )
        return items[0] if items else None

    async def get_all_event_caches(self):
        """Get all event caches."""
        if not self.initialized:
            logger.warning("Cosmos DB not initialized. Using mock database.")
            return []

        container = self.get_container(EVENT_CACHE_CONTAINER)
        if not container:
            return []

        query = "SELECT * FROM c WHERE c.type = 'event_cache'"
        return list(
            container.query_items(query=query, enable_cross_partition_query=True)
        )


# Create a singleton instance
cosmos_db = CosmosDB()


# Initialize the database on startup
def init_db():
    cosmos_db.initialize()
