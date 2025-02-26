from pydantic import BaseModel, Field
from typing import Dict, Any
from datetime import datetime, timedelta


class EventCache(BaseModel):
    artistId: str
    eventData: Dict[str, Any]
    computedAt: datetime = Field(default_factory=datetime.utcnow)
    expiresAt: datetime = Field(
        default_factory=lambda: datetime.utcnow() + timedelta(days=1)
    )

    class Config:
        json_schema_extra = {
            "example": {
                "artistId": "artist_001",
                "eventData": {
                    "live": [
                        {
                            "title": "Summer Tour 2023",
                            "date": "2023-07-15",
                            "location": "Tokyo Dome",
                            "description": "Annual summer concert tour",
                            "probability": 0.85,
                        }
                    ],
                    "album": [
                        {
                            "title": "New Album Release",
                            "date": "2023-09-01",
                            "description": "The artist's 5th studio album",
                            "probability": 0.75,
                        }
                    ],
                    "goods": [
                        {
                            "title": "Limited Edition Merchandise",
                            "date": "2023-08-01",
                            "description": "Special merchandise for fans",
                            "probability": 0.65,
                        }
                    ],
                },
                "computedAt": "2023-01-01T00:00:00Z",
                "expiresAt": "2023-01-02T00:00:00Z",
            }
        }
