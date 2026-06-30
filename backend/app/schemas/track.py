import uuid

from pydantic import BaseModel, ConfigDict


class TrackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    artist_id: uuid.UUID
    title: str
    spotify_track_id: str | None
    album: str | None
    year: int | None
