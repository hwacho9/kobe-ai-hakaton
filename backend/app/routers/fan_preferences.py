from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.fan_preference import (
    FanPreference,
    FanPreferenceCreate,
    FanPreferenceUpdate,
)
from app.services.auth import get_current_user
from app.db.database import db_service

router = APIRouter(
    prefix="/api/fan-preferences",
    tags=["fan_preferences"],
    responses={404: {"description": "Not found"}},
)


@router.get("/by-artist/{artist_id}", response_model=List[FanPreference])
async def get_fan_preferences_by_artist(
    artist_id: str, current_user: dict = Depends(get_current_user)
):
    """Get all fan preferences for an artist. Requires authentication."""
    return await db_service.get_fan_preferences_by_artist(artist_id)


@router.get("/by-user/{user_id}", response_model=List[FanPreference])
async def get_fan_preferences_by_user(
    user_id: str, current_user: dict = Depends(get_current_user)
):
    """Get all fan preferences for a user. Requires authentication."""
    # Check if the user is requesting their own preferences
    if current_user["userId"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access other users' preferences",
        )

    return await db_service.get_fan_preferences_by_user(user_id)


@router.post("/", response_model=FanPreference, status_code=status.HTTP_201_CREATED)
async def create_fan_preference(
    preference_data: FanPreferenceCreate, current_user: dict = Depends(get_current_user)
):
    """Create a new fan preference. Requires authentication."""
    # Check if the user is creating a preference for themselves
    if current_user["userId"] != preference_data.userId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create preferences for other users",
        )

    # Check if the artist exists
    artist = await db_service.get_artist(preference_data.artistId)
    if not artist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found"
        )

    # Create fan preference
    preference = FanPreference(**preference_data.dict())

    # Save preference to database
    return await db_service.create_fan_preference(preference.dict())


@router.put("/{artist_id}/{user_id}", response_model=FanPreference)
async def update_fan_preference(
    artist_id: str,
    user_id: str,
    preference_data: FanPreferenceUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a fan preference. Requires authentication."""
    # Check if the user is updating their own preference
    if current_user["userId"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update preferences for other users",
        )

    # Get existing preferences for this user and artist
    preferences = await db_service.get_fan_preferences_by_user(user_id)
    preference = next((p for p in preferences if p["artistId"] == artist_id), None)

    if not preference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Fan preference not found"
        )

    # Update preference data
    preference["interests"] = preference_data.interests
    preference["updatedAt"] = FanPreference().updatedAt.isoformat()

    # Save updated preference to database
    return await db_service.update_fan_preference(artist_id, user_id, preference)
