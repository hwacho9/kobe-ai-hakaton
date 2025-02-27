from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import uuid
from datetime import datetime


class ArtistPreference(BaseModel):
    artistId: str
    interests: List[str]  # e.g., ["live", "album", "goods"]


class UserBase(BaseModel):
    email: EmailStr
    username: str
    fullName: Optional[str] = None
    profileImage: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    fullName: Optional[str] = None
    profileImage: Optional[str] = None
    preferences: Optional[List[ArtistPreference]] = None


class User(UserBase):
    userId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    preferences: List[ArtistPreference] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "userId": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "username": "fanuser",
                "fullName": "Fan User",
                "profileImage": "https://example.com/profile.jpg",
                "preferences": [
                    {"artistId": "artist_001", "interests": ["live", "album", "goods"]},
                    {"artistId": "artist_002", "interests": ["live", "goods"]},
                ],
                "createdAt": "2023-01-01T00:00:00Z",
                "updatedAt": "2023-01-01T00:00:00Z",
            }
        }
        json_encoders = {datetime: lambda dt: dt.isoformat()}
