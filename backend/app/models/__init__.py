import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from app.models.enums import Era, PhilosophicalCategory


class Base(DeclarativeBase):
    pass


era_enum = ENUM(Era, name="era", create_type=True)
category_enum = ENUM(PhilosophicalCategory, name="philosophical_category", create_type=True)


class Artist(Base):
    __tablename__ = "artists"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    era: Mapped[Era] = mapped_column(era_enum, nullable=False)
    primary_category: Mapped[PhilosophicalCategory] = mapped_column(category_enum, nullable=False)
    secondary_category: Mapped[PhilosophicalCategory | None] = mapped_column(category_enum, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    spotify_artist_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    traditions: Mapped[list["PhilosophicalTradition"]] = relationship(
        secondary="artist_traditions",
        back_populates="artists",
    )
    tracks: Mapped[list["Track"]] = relationship(back_populates="artist")
    influences_received: Mapped[list["Influence"]] = relationship(
        foreign_keys="Influence.source_artist_id",
        back_populates="source_artist",
    )
    influences_given: Mapped[list["Influence"]] = relationship(
        foreign_keys="Influence.target_artist_id",
        back_populates="target_artist",
    )


class PhilosophicalTradition(Base):
    __tablename__ = "philosophical_traditions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[PhilosophicalCategory] = mapped_column(category_enum, nullable=False)

    artists: Mapped[list[Artist]] = relationship(
        secondary="artist_traditions",
        back_populates="traditions",
    )


class ArtistTradition(Base):
    __tablename__ = "artist_traditions"

    artist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("artists.id", ondelete="CASCADE"), primary_key=True
    )
    tradition_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("philosophical_traditions.id", ondelete="CASCADE"), primary_key=True
    )


class Influence(Base):
    __tablename__ = "influences"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_artist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("artists.id", ondelete="CASCADE"), nullable=False
    )
    target_artist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("artists.id", ondelete="CASCADE"), nullable=False
    )
    connection_label: Mapped[str | None] = mapped_column(Text, nullable=True)
    strength: Mapped[int] = mapped_column(Integer, nullable=False, default=5)

    source_artist: Mapped[Artist] = relationship(
        foreign_keys=[source_artist_id],
        back_populates="influences_received",
    )
    target_artist: Mapped[Artist] = relationship(
        foreign_keys=[target_artist_id],
        back_populates="influences_given",
    )


class Track(Base):
    __tablename__ = "tracks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("artists.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    spotify_track_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    album: Mapped[str | None] = mapped_column(Text, nullable=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)

    artist: Mapped[Artist] = relationship(back_populates="tracks")
    breakdowns: Mapped[list["LyricBreakdown"]] = relationship(back_populates="track")


class LyricBreakdown(Base):
    __tablename__ = "lyric_breakdowns"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    track_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tracks.id", ondelete="CASCADE"), nullable=False
    )
    lyric_excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    philosophical_analysis: Mapped[str] = mapped_column(Text, nullable=False)
    tradition_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("philosophical_traditions.id", ondelete="SET NULL"), nullable=True
    )
    submitted_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    is_curated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    track: Mapped[Track] = relationship(back_populates="breakdowns")
    tradition: Mapped[PhilosophicalTradition | None] = relationship()
