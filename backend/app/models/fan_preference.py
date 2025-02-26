from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


class FanPreferenceBase(BaseModel):
    artistId: str
    userId: str
    interests: List[str]  # e.g., ["live", "album", "goods"]


class FanPreferenceCreate(FanPreferenceBase):
    pass


class FanPreferenceUpdate(BaseModel):
    interests: List[str]


class FanPreference(FanPreferenceBase):
    registeredAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "artistId": "artist_001",
                "userId": "550e8400-e29b-41d4-a716-446655440000",
                "interests": ["live", "album", "goods"],
                "registeredAt": "2023-01-01T00:00:00Z",
                "updatedAt": "2023-01-01T00:00:00Z",
            }
        }
