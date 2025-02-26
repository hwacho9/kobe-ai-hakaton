import os
import logging
from app.db.cosmos_db import cosmos_db
from app.db.mock_db import mock_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Check if Cosmos DB credentials are provided
COSMOS_ENDPOINT = os.getenv("AZURE_COSMOS_DB_ENDPOINT")
COSMOS_KEY = os.getenv("AZURE_COSMOS_DB_KEY")


class DatabaseService:
    """Database service that uses either Cosmos DB or the mock database."""

    def __init__(self):
        self.use_cosmos = bool(COSMOS_ENDPOINT and COSMOS_KEY)
        self.db = cosmos_db if self.use_cosmos else mock_db
        logger.info(
            f"Using {'Cosmos DB' if self.use_cosmos else 'Mock DB'} for database operations"
        )

    async def create_user(self, user_data):
        """Create a new user."""
        return await self.db.create_user(user_data)

    async def get_user(self, user_id):
        """Get a user by ID."""
        return await self.db.get_user(user_id)

    async def get_all_users(self):
        """Get all users."""
        return await self.db.get_all_users()

    async def update_user(self, user_id, user_data):
        """Update a user."""
        return await self.db.update_user(user_id, user_data)

    async def create_artist(self, artist_data):
        """Create a new artist."""
        return await self.db.create_artist(artist_data)

    async def get_artist(self, artist_id):
        """Get an artist by ID."""
        return await self.db.get_artist(artist_id)

    async def get_all_artists(self):
        """Get all artists."""
        return await self.db.get_all_artists()

    async def update_artist(self, artist_id, artist_data):
        """Update an artist."""
        return await self.db.update_artist(artist_id, artist_data)

    async def create_fan_preference(self, preference_data):
        """Create a new fan preference."""
        return await self.db.create_fan_preference(preference_data)

    async def get_fan_preferences_by_artist(self, artist_id):
        """Get all fan preferences for an artist."""
        return await self.db.get_fan_preferences_by_artist(artist_id)

    async def get_fan_preferences_by_user(self, user_id):
        """Get all fan preferences for a user."""
        return await self.db.get_fan_preferences_by_user(user_id)

    async def update_fan_preference(self, artist_id, user_id, preference_data):
        """Update a fan preference."""
        return await self.db.update_fan_preference(artist_id, user_id, preference_data)

    async def get_event_cache(self, artist_id):
        """Get cached event data for an artist."""
        return await self.db.get_event_cache(artist_id)

    async def create_or_update_event_cache(self, event_data):
        """Create or update cached event data."""
        return await self.db.create_or_update_event_cache(event_data)


# Create a singleton instance
db_service = DatabaseService()


# Initialize the database on startup
def init_db():
    if db_service.use_cosmos:
        cosmos_db.initialize()
