import Link from 'next/link'
import type { ArtistDetail, Breakdown, Track } from '@/lib/types'
import { CATEGORY_COLORS, CATEGORY_DESCRIPTIONS, CATEGORY_LABELS } from '@/lib/constants'
import { EraBadge } from './EraBadge'
import { CategoryBadge } from './CategoryBadge'
import { SpotifyArtistFollow, SpotifyEmbed } from './SpotifyEmbed'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FadeInView } from '@/components/motion/FadeInView'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Props {
  artist: ArtistDetail
  tracks: Track[]
  breakdowns: Breakdown[]
}

export function ArtistProfile({ artist, tracks, breakdowns }: Props) {
  return (
    <div>
      <section className="grain-overlay relative border-b border-chamber-border">
        <FadeInView className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {artist.image_url ? (
              <img
                src={artist.image_url}
                alt={artist.name}
                className="h-48 w-48 border border-chamber-border object-cover"
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center border border-chamber-border bg-chamber-surface">
                <span className="font-heading text-4xl text-primary">{artist.name.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap gap-2">
                <EraBadge era={artist.era} />
                <CategoryBadge category={artist.primary_category} />
                {artist.secondary_category && (
                  <CategoryBadge category={artist.secondary_category} />
                )}
              </div>
              <h1 className="font-heading mb-4 text-4xl font-bold text-white sm:text-5xl">
                {artist.name}
              </h1>
              {artist.bio && <p className="max-w-2xl text-muted-foreground">{artist.bio}</p>}
              {artist.spotify_artist_id && (
                <div className="mt-6">
                  <SpotifyArtistFollow artistId={artist.spotify_artist_id} />
                </div>
              )}
            </div>
          </div>
        </FadeInView>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <FadeInView className="mb-12">
          <h2 className="font-heading mb-6 text-2xl font-bold text-white">Philosophical DNA</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-none border-chamber-border bg-chamber-surface ring-0">
              <CardHeader>
                <p className="text-xs uppercase tracking-wider text-primary">Primary</p>
                <CardTitle>{CATEGORY_LABELS[artist.primary_category]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_DESCRIPTIONS[artist.primary_category]}
                </p>
              </CardContent>
            </Card>
            {artist.secondary_category && (
              <Card className="rounded-none border-chamber-border bg-chamber-surface ring-0">
                <CardHeader>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Secondary</p>
                  <CardTitle>{CATEGORY_LABELS[artist.secondary_category]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {CATEGORY_DESCRIPTIONS[artist.secondary_category]}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </FadeInView>

        {artist.traditions.length > 0 && (
          <FadeInView className="mb-12" delay={0.03}>
            <h2 className="font-heading mb-6 text-2xl font-bold text-white">Philosophical Traditions</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artist.traditions.map((tradition) => (
                <Card
                  key={tradition.id}
                  className="rounded-none border-chamber-border bg-chamber-surface py-0 ring-0"
                  style={{ borderTopWidth: 3, borderTopColor: CATEGORY_COLORS[tradition.category] }}
                >
                  <CardHeader className="px-5 pt-5">
                    <CategoryBadge category={tradition.category} />
                    <CardTitle className="font-heading mt-2 text-lg text-white">{tradition.name}</CardTitle>
                  </CardHeader>
                  {tradition.description && (
                    <CardContent className="px-5 pb-5">
                      <p className="text-sm leading-relaxed text-muted-foreground">{tradition.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </FadeInView>
        )}

        {artist.influences.length > 0 && (
          <FadeInView className="mb-12" delay={0.05}>
            <h2 className="font-heading mb-6 text-2xl font-bold text-white">Influences</h2>
            <div className="flex flex-wrap gap-3">
              {artist.influences.map((inf) => (
                <Link key={inf.id} href={`/artist/${inf.target_artist_id}`}>
                  <Card
                    className={cn(
                      'rounded-none border-chamber-border bg-chamber-surface py-0 ring-0 transition-colors hover:border-primary',
                    )}
                  >
                    <CardContent className="px-4 py-3">
                      <p className="font-heading font-semibold text-white">{inf.target_artist_name}</p>
                      {inf.connection_label && (
                        <p className="mt-1 text-xs text-muted-foreground">{inf.connection_label}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </FadeInView>
        )}

        <FadeInView className="mb-12" delay={0.1}>
          <h2 className="font-heading mb-6 text-2xl font-bold text-white">Key Tracks</h2>
          <div className="space-y-4">
            {tracks.map((track) => (
              <Card key={track.id} className="rounded-none border-chamber-border bg-chamber-surface py-0 ring-0">
                <CardHeader className="px-4 pt-4">
                  <CardTitle className="text-base">{track.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {track.album} {track.year ? `(${track.year})` : ''}
                  </p>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {track.spotify_track_id && <SpotifyEmbed trackId={track.spotify_track_id} />}
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeInView>

        {breakdowns.length > 0 && (
          <FadeInView delay={0.15}>
            <Separator className="mb-6 bg-chamber-border" />
            <h2 className="font-heading mb-6 text-2xl font-bold text-white">Lyric Breakdowns</h2>
            <div className="space-y-6">
              {breakdowns.map((b) => (
                <Card key={b.id} className="rounded-none border-chamber-border bg-chamber-surface py-0 ring-0">
                  <CardHeader className="px-6 pt-6">
                    <div className="flex items-center gap-2">
                      <p className="text-xs uppercase tracking-wider text-primary">{b.track_title}</p>
                      {b.is_curated && (
                        <Badge variant="outline" className="rounded-none border-primary text-primary">
                          Curated
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <blockquote className="mb-4 border-l-2 border-primary pl-4 italic text-foreground/90">
                      &ldquo;{b.lyric_excerpt}&rdquo;
                    </blockquote>
                    <p className="text-sm leading-relaxed text-muted-foreground">{b.philosophical_analysis}</p>
                    {b.tradition_name && (
                      <p className="mt-3 text-xs text-muted-foreground">Tradition: {b.tradition_name}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </FadeInView>
        )}
      </div>
    </div>
  )
}
