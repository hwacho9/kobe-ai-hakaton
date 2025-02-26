import logging
from datetime import datetime
import copy

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mock database storage
mock_data = {"users": {}, "artists": {}, "fan_preferences": [], "event_cache": {}}


class MockDB:
    """Mock database for development and testing when Cosmos DB is not available."""

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
