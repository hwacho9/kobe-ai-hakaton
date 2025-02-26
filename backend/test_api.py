import httpx
import json
import asyncio
from pprint import pprint

BASE_URL = "http://localhost:8000"


async def test_api():
    async with httpx.AsyncClient() as client:
        # Test health endpoint
        print("\n=== Testing Health Endpoint ===")
        response = await client.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        pprint(response.json())

        # Register a user
        print("\n=== Registering a User ===")
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "fullName": "Test User",
            "password": "password123",
        }
        response = await client.post(f"{BASE_URL}/api/auth/register", json=user_data)
        print(f"Status: {response.status_code}")
        user = response.json()
        pprint(user)
        user_id = user.get("userId")

        # Login
        print("\n=== Logging In ===")
        login_data = {
            "username": "test@example.com",  # Using email as username for login
            "password": "password123",
        }
        response = await client.post(f"{BASE_URL}/api/auth/token", data=login_data)
        print(f"Status: {response.status_code}")
        token_data = response.json()
        pprint(token_data)
        token = token_data.get("access_token")

        # Get current user
        print("\n=== Getting Current User ===")
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.get(f"{BASE_URL}/api/auth/me", headers=headers)
        print(f"Status: {response.status_code}")
        pprint(response.json())

        # Create an artist
        print("\n=== Creating an Artist ===")
        artist_data = {
            "name": "Test Artist",
            "genre": ["Pop", "Rock"],
            "description": "A test artist for API testing",
        }
        response = await client.post(
            f"{BASE_URL}/api/artists", json=artist_data, headers=headers
        )
        print(f"Status: {response.status_code}")
        artist = response.json()
        pprint(artist)
        artist_id = artist.get("artistId")

        # Get all artists
        print("\n=== Getting All Artists ===")
        response = await client.get(f"{BASE_URL}/api/artists")
        print(f"Status: {response.status_code}")
        pprint(response.json())

        # Create a fan preference
        print("\n=== Creating a Fan Preference ===")
        preference_data = {
            "artistId": artist_id,
            "userId": user_id,
            "interests": ["live", "album", "goods"],
        }
        response = await client.post(
            f"{BASE_URL}/api/fan-preferences", json=preference_data, headers=headers
        )
        print(f"Status: {response.status_code}")
        pprint(response.json())

        # Get fan preferences by user
        print("\n=== Getting Fan Preferences by User ===")
        response = await client.get(
            f"{BASE_URL}/api/fan-preferences/by-user/{user_id}", headers=headers
        )
        print(f"Status: {response.status_code}")
        pprint(response.json())

        # Update fan preference
        print("\n=== Updating Fan Preference ===")
        update_data = {"interests": ["live", "goods"]}  # Removed "album"
        response = await client.put(
            f"{BASE_URL}/api/fan-preferences/{artist_id}/{user_id}",
            json=update_data,
            headers=headers,
        )
        print(f"Status: {response.status_code}")
        pprint(response.json())


if __name__ == "__main__":
    asyncio.run(test_api())
