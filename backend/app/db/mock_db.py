import logging
from datetime import datetime
import copy
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mock database storage
mock_data = {
    "users": {
        "1": {
            "userId": "1",
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
            "fullName": "Test User",
            "profileImage": "https://example.com/profile.jpg",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z",
            "preferences": ["music", "travel", "food"],
        },
    },
    "artists": {},
    "fan_preferences": [],
    "event_cache": {},
    "event_cost_calculations": [],  # 이벤트 비용 계산 결과를 저장하기 위한 컬렉션
}


class MockCollection:
    """Mock collection class to simulate Cosmos DB container operations."""

    def __init__(self, collection_name):
        self.collection_name = collection_name

    def create_item(self, body):
        """Create a new item in the collection."""
        logger.info(f"Creating item in mock collection: {self.collection_name}")

        # 컬렉션 타입에 따라 처리
        if isinstance(mock_data[self.collection_name], list):
            # ID가 없으면 생성
            if "id" not in body:
                body["id"] = str(uuid.uuid4())
            mock_data[self.collection_name].append(copy.deepcopy(body))
        elif isinstance(mock_data[self.collection_name], dict):
            # 딕셔너리 타입 컬렉션인 경우
            item_id = body.get("id")
            if not item_id:
                item_id = str(uuid.uuid4())
                body["id"] = item_id
            mock_data[self.collection_name][item_id] = copy.deepcopy(body)

        return copy.deepcopy(body)

    def query_items(self, query, enable_cross_partition_query=True):
        """Query items from the collection."""
        logger.info(
            f"Querying items in mock collection: {self.collection_name} with query: {query}"
        )

        # 매우 단순화된 쿼리 처리 (실제 SQL 쿼리 처리는 복잡하지만 여기서는 간단하게 구현)
        # 실제 애플리케이션에서는 더 복잡한 쿼리 파싱이 필요할 수 있음

        # 컬렉션의 모든 아이템 반환
        if isinstance(mock_data[self.collection_name], list):
            # 리스트 타입 컬렉션인 경우
            items = mock_data[self.collection_name]
        elif isinstance(mock_data[self.collection_name], dict):
            # 딕셔너리 타입 컬렉션인 경우
            items = list(mock_data[self.collection_name].values())
        else:
            items = []

        # 딥 카피하여 원본 데이터 변경 방지
        return copy.deepcopy(items)


class MockDB:
    """Mock database for development and testing when Cosmos DB is not available."""

    # Collection operations
    async def get_collection(self, collection_name):
        """Get a collection by name from the mock database."""
        logger.info(f"Getting mock collection: {collection_name}")
        # 컬렉션이 존재하지 않는 경우 빈 컬렉션 생성
        if collection_name not in mock_data:
            mock_data[collection_name] = []
            logger.info(f"Created new mock collection: {collection_name}")

        # 컬렉션 프록시 객체 반환
        return MockCollection(collection_name)

    # User operations
    async def create_user(self, user_data):
        """Create a new user in the mock database."""
        user_id = user_data.get("userId")
        if not user_id:
            raise ValueError("User ID is required")

        # Check if user already exists
        if user_id in mock_data["users"]:
            raise ValueError(f"User with ID {user_id} already exists")

        # Store user data
        mock_data["users"][user_id] = copy.deepcopy(user_data)
        logger.info(f"Created user with ID: {user_id}")
        return mock_data["users"][user_id]

    async def get_user(self, user_id):
        """Get a user by ID from the mock database."""
        user = mock_data["users"].get(user_id)
        if user:
            return copy.deepcopy(user)
        return None

    async def get_all_users(self):
        """Get all users from the mock database."""
        return list(copy.deepcopy(mock_data["users"].values()))

    async def update_user(self, user_id, user_data):
        """Update a user in the mock database."""
        if user_id not in mock_data["users"]:
            return None

        # Update user data
        user = mock_data["users"][user_id]
        for key, value in user_data.items():
            if key != "userId":  # Don't update the ID
                user[key] = value

        user["updatedAt"] = datetime.utcnow().isoformat()
        logger.info(f"Updated user with ID: {user_id}")
        return copy.deepcopy(user)

    # Artist operations
    async def create_artist(self, artist_data):
        """Create a new artist in the mock database."""
        artist_id = artist_data.get("artistId")
        if not artist_id:
            raise ValueError("Artist ID is required")

        # Check if artist already exists
        if artist_id in mock_data["artists"]:
            raise ValueError(f"Artist with ID {artist_id} already exists")

        # Store artist data
        mock_data["artists"][artist_id] = copy.deepcopy(artist_data)
        logger.info(f"Created artist with ID: {artist_id}")
        return mock_data["artists"][artist_id]

    async def get_artist(self, artist_id):
        """Get an artist by ID from the mock database."""
        artist = mock_data["artists"].get(artist_id)
        if artist:
            return copy.deepcopy(artist)
        return None

    async def get_all_artists(self):
        """Get all artists from the mock database."""
        return list(copy.deepcopy(mock_data["artists"].values()))

    async def update_artist(self, artist_id, artist_data):
        """Update an artist in the mock database."""
        if artist_id not in mock_data["artists"]:
            return None

        # Update artist data
        artist = mock_data["artists"][artist_id]
        for key, value in artist_data.items():
            if key != "artistId":  # Don't update the ID
                artist[key] = value

        artist["updatedAt"] = datetime.utcnow().isoformat()
        logger.info(f"Updated artist with ID: {artist_id}")
        return copy.deepcopy(artist)

    # Fan Preference operations
    async def create_fan_preference(self, preference_data):
        """Create a new fan preference in the mock database."""
        artist_id = preference_data.get("artistId")
        user_id = preference_data.get("userId")

        if not artist_id or not user_id:
            raise ValueError("Artist ID and User ID are required")

        # Check if preference already exists
        for pref in mock_data["fan_preferences"]:
            if pref["artistId"] == artist_id and pref["userId"] == user_id:
                raise ValueError(
                    f"Preference for artist {artist_id} and user {user_id} already exists"
                )

        # Store preference data
        mock_data["fan_preferences"].append(copy.deepcopy(preference_data))
        logger.info(f"Created fan preference for artist {artist_id} and user {user_id}")

        # Update artist fan count
        if artist_id in mock_data["artists"]:
            mock_data["artists"][artist_id]["fanCount"] += 1

        return preference_data

    async def get_fan_preferences_by_artist(self, artist_id):
        """Get all fan preferences for an artist from the mock database."""
        return [
            copy.deepcopy(pref)
            for pref in mock_data["fan_preferences"]
            if pref["artistId"] == artist_id
        ]

    async def get_fan_preferences_by_user(self, user_id):
        """Get all fan preferences for a user from the mock database."""
        return [
            copy.deepcopy(pref)
            for pref in mock_data["fan_preferences"]
            if pref["userId"] == user_id
        ]

    async def update_fan_preference(self, artist_id, user_id, preference_data):
        """Update a fan preference in the mock database."""
        # Find the preference to update
        for i, pref in enumerate(mock_data["fan_preferences"]):
            if pref["artistId"] == artist_id and pref["userId"] == user_id:
                # Update preference data
                mock_data["fan_preferences"][i].update(preference_data)
                logger.info(
                    f"Updated fan preference for artist {artist_id} and user {user_id}"
                )
                return copy.deepcopy(mock_data["fan_preferences"][i])
        return None

    # Event Cache operations
    async def get_event_cache(self, artist_id):
        """Get cached event data for an artist from the mock database."""
        cache = mock_data["event_cache"].get(artist_id)
        if cache:
            # Check if cache is expired
            expires_at = datetime.fromisoformat(cache["expiresAt"])
            if expires_at < datetime.utcnow():
                logger.info(f"Cache for artist {artist_id} is expired")
                return None
            return copy.deepcopy(cache)
        return None

    async def create_or_update_event_cache(self, event_data):
        """Create or update cached event data in the mock database."""
        artist_id = event_data.get("artistId")
        if not artist_id:
            raise ValueError("Artist ID is required")

        # Store cache data
        mock_data["event_cache"][artist_id] = copy.deepcopy(event_data)
        logger.info(f"Created/updated event cache for artist {artist_id}")
        return mock_data["event_cache"][artist_id]


# Create a singleton instance
mock_db = MockDB()
