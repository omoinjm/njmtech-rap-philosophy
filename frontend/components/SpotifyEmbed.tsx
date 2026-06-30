interface Props {
  trackId: string
  height?: number
}

export function SpotifyEmbed({ trackId, height = 152 }: Props) {
  if (!trackId) return null

  return (
    <iframe
      title="Spotify player"
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
      width="100%"
      height={height}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="border border-chamber-border"
      style={{ borderRadius: 0 }}
    />
  )
}

export function SpotifyArtistFollow({ artistId }: { artistId: string }) {
  if (!artistId) return null

  return (
    <iframe
      title="Follow on Spotify"
      src={`https://open.spotify.com/follow/embed/?uri=spotify:artist:${artistId}&size=detail&theme=dark`}
      width="100%"
      height="56"
      allow="encrypted-media"
      loading="lazy"
      className="border border-chamber-border max-w-xs"
      style={{ borderRadius: 0 }}
    />
  )
}
