from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


class ArtistBase(BaseModel):
    name: str
    genre: Optional[List[str]] = None
    profileImage: Optional[str] = None
    description: Optional[str] = None


class ArtistCreate(ArtistBase):
    pass


class ArtistUpdate(BaseModel):
    name: Optional[str] = None
    genre: Optional[List[str]] = None
    profileImage: Optional[str] = None
    description: Optional[str] = None


class Artist(ArtistBase):
    artistId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fanCount: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "artistId": "artist_001",
                "name": "Artist Name",
                "genre": ["Pop", "Rock"],
                "profileImage": "https://example.com/artist.jpg",
                "description": "Famous artist with multiple hit albums",
                "fanCount": 1000,
                "createdAt": "2023-01-01T00:00:00Z",
                "updatedAt": "2023-01-01T00:00:00Z",
            }
        }
