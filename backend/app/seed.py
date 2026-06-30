"""Database seeder — runs on first startup when artists table is empty."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Artist,
    ArtistTradition,
    Influence,
    LyricBreakdown,
    PhilosophicalTradition,
    Track,
)
from app.models.enums import Era, PhilosophicalCategory

TRADITIONS = [
    {
        "name": "Five-Percent Nation",
        "description": "Nation of Gods and Earths teachings on knowledge of self, Supreme Mathematics, and divine identity.",
        "category": PhilosophicalCategory.epistemology_mysticism,
    },
    {
        "name": "Stoicism",
        "description": "Ancient philosophy of endurance, discipline, and acceptance of fate under harsh conditions.",
        "category": PhilosophicalCategory.street_stoicism,
    },
    {
        "name": "Marxist Theory",
        "description": "Class analysis, dialectical materialism, and critique of capitalist structures.",
        "category": PhilosophicalCategory.revolutionary_geopolitics,
    },
    {
        "name": "Afrocentric Humanism",
        "description": "Black consciousness, community ethics, and cultural self-determination.",
        "category": PhilosophicalCategory.social_ethics,
    },
    {
        "name": "Taoism",
        "description": "The way of natural flow, balance, and wu wei — action through non-action.",
        "category": PhilosophicalCategory.epistemology_mysticism,
    },
    {
        "name": "Existentialism",
        "description": "Radical freedom, authenticity, and creating meaning in an absurd world.",
        "category": PhilosophicalCategory.social_ethics,
    },
]

ARTISTS = [
    {
        "name": "The RZA",
        "era": Era.old_school,
        "primary_category": PhilosophicalCategory.epistemology_mysticism,
        "secondary_category": PhilosophicalCategory.revolutionary_geopolitics,
        "bio": "Abbot of the Wu-Tang Clan. Architect of Shaolin mathematics, chess strategy, and cinematic kung-fu philosophy applied to beat-making and street knowledge.",
        "spotify_artist_id": "690sxjOsFr2w0k3JNQkH7T",
    },
    {
        "name": "Roc Marciano",
        "era": Era.old_school,
        "primary_category": PhilosophicalCategory.street_stoicism,
        "secondary_category": PhilosophicalCategory.epistemology_mysticism,
        "bio": "Marci Beaucoup. The godfather of drumless luxury loops — criminal stoicism rendered as minimalist street scripture.",
        "spotify_artist_id": "4kYSro6naA4h99UJvo89B1",
    },
    {
        "name": "Immortal Technique",
        "era": Era.old_school,
        "primary_category": PhilosophicalCategory.revolutionary_geopolitics,
        "secondary_category": PhilosophicalCategory.social_ethics,
        "bio": "Peruvian-American revolutionary MC. Uncompromising geopolitical analysis, class consciousness, and guerrilla rhetoric.",
        "spotify_artist_id": "6jBq8hE0u6Ov3VMSUkmplX",
    },
    {
        "name": "Westside Gunn",
        "era": Era.bridge,
        "primary_category": PhilosophicalCategory.street_stoicism,
        "secondary_category": PhilosophicalCategory.epistemology_mysticism,
        "bio": "Flygod. Griselda co-founder. Wrestler aesthetics meet luxury crime rap — the bridge between RZA's mysticism and Roc's stoicism.",
        "spotify_artist_id": "0FjnQ8lJOM3L4zN1Q2j8lO",
    },
    {
        "name": "Joey Bada$$",
        "era": Era.bridge,
        "primary_category": PhilosophicalCategory.epistemology_mysticism,
        "secondary_category": PhilosophicalCategory.social_ethics,
        "bio": "Pro Era founder. Brooklyn's bridge generation — 90s consciousness reimagined for the streaming era.",
        "spotify_artist_id": "2P5sC9C1bM9Z2f0vFUXGLO",
    },
    {
        "name": "A Tribe Called Quest",
        "era": Era.old_school,
        "primary_category": PhilosophicalCategory.social_ethics,
        "secondary_category": PhilosophicalCategory.epistemology_mysticism,
        "bio": "Native Tongues architects. Jazz-inflected Afrocentric humanism, community ethics, and the low end theory of conscious rap.",
        "spotify_artist_id": "09ABFppSlC3DXuLtXq6C2O",
    },
    {
        "name": "Navy Blue",
        "era": Era.new_school,
        "primary_category": PhilosophicalCategory.social_ethics,
        "secondary_category": PhilosophicalCategory.epistemology_mysticism,
        "bio": "Def Jam A&R turned producer-MC. Introspective new school ethics rooted in Tribe Called Quest lineage.",
        "spotify_artist_id": "1QAJqy2dA3ihHRCdP0ut1N",
    },
    {
        "name": "Armand Hammer",
        "era": Era.new_school,
        "primary_category": PhilosophicalCategory.revolutionary_geopolitics,
        "secondary_category": PhilosophicalCategory.epistemology_mysticism,
        "bio": "billy woods and ELUCID. Abstract revolutionary geopolitics — paranoia, poetry, and post-colonial theory over alchemical beats.",
        "spotify_artist_id": "3cQO7jp5S9qLBoIVtbkSM1",
    },
    {
        "name": "Boldy James",
        "era": Era.new_school,
        "primary_category": PhilosophicalCategory.street_stoicism,
        "secondary_category": PhilosophicalCategory.social_ethics,
        "bio": "Detroit's measured narrator. Roc Marciano's heir apparent — unhurried stoic storytelling over Alchemist and Real Bad Man production.",
        "spotify_artist_id": "4kH4Nup7e1GlsTSECiimmI",
    },
]

# source (influenced) → target (blueprint)
INFLUENCES = [
    ("Westside Gunn", "Roc Marciano", "Criminal Stoicism; Drumless Luxury Loops", 9),
    ("Westside Gunn", "The RZA", "Shaolin Mathematics; Cinematic Mysticism", 8),
    ("Joey Bada$$", "The RZA", "Five-Percent Knowledge; Beat Architecture", 7),
    ("Joey Bada$$", "A Tribe Called Quest", "Native Tongues Ethics; Jazz Consciousness", 9),
    ("Navy Blue", "A Tribe Called Quest", "Low End Theory Lineage; Community Ethics", 8),
    ("Armand Hammer", "Immortal Technique", "Revolutionary Geopolitics; Guerrilla Rhetoric", 8),
    ("Boldy James", "Roc Marciano", "Measured Stoicism; Crime Narrative Minimalism", 9),
]

TRACKS = [
    ("The RZA", "Protect Ya Neck", "4VjU8Ie8dXOkdUiIVz755a", "Enter the Wu-Tang (36 Chambers)", 1993),
    ("Roc Marciano", "Pimpstrumentals", "3YQO5Y1Q4Q4Q4Q4Q4Q4Q4Q4", "Marcberg", 2010),
    ("Immortal Technique", "Dance with the Devil", "4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4", "Revolutionary Vol. 1", 2001),
    ("Westside Gunn", "327", "5Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4", "Pray for Paris", 2020),
    ("Joey Bada$$", "1999", "6Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4", "1999", 2012),
    ("A Tribe Called Quest", "Can I Kick It?", "3Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4", "People's Instinctive Travels", 1990),
    ("Navy Blue", "Song of Sage", "7Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4", "Song of Sage: Post Panic!", 2020),
    ("Armand Hammer", "Falling Out the Sky", "8Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4", "Haram", 2020),
    ("Boldy James", "First 48 Freestyle", "9Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4", "Bo Jackson", 2021),
]

BREAKDOWNS = [
    (
        "The RZA",
        "Protect Ya Neck",
        "Shaolin shadowboxin' and the Wu-Tang sword style",
        "RZA encodes Five-Percent Nation mathematics into battle rhetoric — each member's verse is a cipher of self-knowledge, transforming the cipher into a philosophical proving ground.",
        "Five-Percent Nation",
        True,
    ),
    (
        "Immortal Technique",
        "Dance with the Devil",
        "I'mma tell you a story about a kid from Harlem",
        "A parable of moral collapse under capitalism's violence — existentialist horror rendered as street testimony, forcing the listener to confront complicity without redemption.",
        "Marxist Theory",
        True,
    ),
    (
        "A Tribe Called Quest",
        "Can I Kick It?",
        "Can I kick it? To all my people",
        "The call-and-response structure embodies Afrocentric community ethics — the cipher as democratic space where every voice validates the collective.",
        "Afrocentric Humanism",
        True,
    ),
]


async def seed_database(session: AsyncSession) -> None:
    result = await session.execute(select(Artist).limit(1))
    if result.scalar_one_or_none() is not None:
        return

    tradition_map: dict[str, uuid.UUID] = {}
    for t in TRADITIONS:
        tradition = PhilosophicalTradition(**t)
        session.add(tradition)
        await session.flush()
        tradition_map[t["name"]] = tradition.id

    artist_map: dict[str, uuid.UUID] = {}
    for a in ARTISTS:
        artist = Artist(**a)
        session.add(artist)
        await session.flush()
        artist_map[a["name"]] = artist.id

    # Link artists to traditions matching their primary category
    for a in ARTISTS:
        artist_id = artist_map[a["name"]]
        for t in TRADITIONS:
            if t["category"] == a["primary_category"]:
                session.add(
                    ArtistTradition(
                        artist_id=artist_id,
                        tradition_id=tradition_map[t["name"]],
                    )
                )

    for source_name, target_name, label, strength in INFLUENCES:
        session.add(
            Influence(
                source_artist_id=artist_map[source_name],
                target_artist_id=artist_map[target_name],
                connection_label=label,
                strength=strength,
            )
        )

    track_map: dict[tuple[str, str], uuid.UUID] = {}
    for artist_name, title, spotify_id, album, year in TRACKS:
        track = Track(
            artist_id=artist_map[artist_name],
            title=title,
            spotify_track_id=spotify_id,
            album=album,
            year=year,
        )
        session.add(track)
        await session.flush()
        track_map[(artist_name, title)] = track.id

    for artist_name, track_title, excerpt, analysis, tradition_name, is_curated in BREAKDOWNS:
        session.add(
            LyricBreakdown(
                track_id=track_map[(artist_name, track_title)],
                lyric_excerpt=excerpt,
                philosophical_analysis=analysis,
                tradition_id=tradition_map.get(tradition_name),
                is_curated=is_curated,
            )
        )

    await session.commit()
