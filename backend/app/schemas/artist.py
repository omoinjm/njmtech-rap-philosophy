import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import Era, PhilosophicalCategory


class TraditionBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    category: PhilosophicalCategory


class InfluenceBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    target_artist_id: uuid.UUID
    target_artist_name: str
    connection_label: str | None
    strength: int


class ArtistBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    era: Era
    primary_category: PhilosophicalCategory
    secondary_category: PhilosophicalCategory | None
    bio: str | None
    spotify_artist_id: str | None
    image_url: str | None
    created_at: datetime


class ArtistListItem(ArtistBase):
    pass


class ArtistDetail(ArtistBase):
    traditions: list[TraditionBrief]
    influences: list[InfluenceBrief]
