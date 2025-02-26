from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.artist import Artist, ArtistCreate, ArtistUpdate
from app.services.auth import get_current_user
from app.db.database import db_service

router = APIRouter(
    prefix="/api/artists",
    tags=["artists"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[Artist])
async def get_artists():
    """Get all artists."""
    return await db_service.get_all_artists()


@router.get("/{artist_id}", response_model=Artist)
async def get_artist(artist_id: str):
    """Get an artist by ID."""
    artist = await db_service.get_artist(artist_id)
    if not artist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found"
        )
    return artist


@router.post("/", response_model=Artist, status_code=status.HTTP_201_CREATED)
async def create_artist(
    artist_data: ArtistCreate, current_user: dict = Depends(get_current_user)
):
    """Create a new artist. Requires authentication."""
    # Create artist object
    artist = Artist(**artist_data.dict())

    # Save artist to database
    return await db_service.create_artist(artist.dict())


@router.put("/{artist_id}", response_model=Artist)
async def update_artist(
    artist_id: str,
    artist_data: ArtistUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update an artist. Requires authentication."""
    # Get existing artist
    existing_artist = await db_service.get_artist(artist_id)
    if not existing_artist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found"
        )

    # Update artist data
    update_data = artist_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        existing_artist[key] = value

    # Save updated artist to database
    return await db_service.update_artist(artist_id, existing_artist)
