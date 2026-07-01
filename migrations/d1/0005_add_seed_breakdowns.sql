-- Add curated breakdowns for artists that only had tracks without analyses.

INSERT INTO lyric_breakdowns (id, track_id, lyric_excerpt, philosophical_analysis, tradition_id, is_curated)
SELECT
  'b1000001-0000-4000-8000-000000000001',
  t.id,
  'The white turns to grey, and the grey turns to black',
  'Marciano treats the block as a Stoic proving ground — snow as metaphor for purity corrupted by commerce, narrated with unhurried discipline. Every bar is acceptance of fate without sentimentality.',
  pt.id,
  1
FROM tracks t
JOIN artists a ON a.id = t.artist_id
JOIN philosophical_traditions pt ON pt.name = 'Stoicism'
WHERE a.name = 'Roc Marciano' AND t.title IN ('Snow', 'Pimpstrumentals')
  AND NOT EXISTS (SELECT 1 FROM lyric_breakdowns lb WHERE lb.track_id = t.id);

INSERT INTO lyric_breakdowns (id, track_id, lyric_excerpt, philosophical_analysis, tradition_id, is_curated)
SELECT
  'b1000002-0000-4000-8000-000000000002',
  t.id,
  'Flygod, I''m on one, Griselda',
  '327 is luxury crime rap as Shaolin cinema — Gunn maps wrestler mythology and street stoicism onto Buffalo economics, treating violence and branding as the same spectacle of power.',
  pt.id,
  1
FROM tracks t
JOIN artists a ON a.id = t.artist_id
JOIN philosophical_traditions pt ON pt.name = 'Stoicism'
WHERE a.name = 'Westside Gunn' AND t.title = '327'
  AND NOT EXISTS (SELECT 1 FROM lyric_breakdowns lb WHERE lb.track_id = t.id);

INSERT INTO lyric_breakdowns (id, track_id, lyric_excerpt, philosophical_analysis, tradition_id, is_curated)
SELECT
  'b1000003-0000-4000-8000-000000000003',
  t.id,
  'My brain about to explode, he thought he could change the world',
  'At seventeen, Joey encodes Five-Percent self-knowledge into boom-bap optimism — waves as consciousness rising through Brooklyn, where knowing yourself is the prerequisite for any world-changing claim.',
  pt.id,
  1
FROM tracks t
JOIN artists a ON a.id = t.artist_id
JOIN philosophical_traditions pt ON pt.name = 'Five-Percent Nation'
WHERE a.name = 'Joey Bada$$' AND t.title IN ('Waves', '1999')
  AND NOT EXISTS (SELECT 1 FROM lyric_breakdowns lb WHERE lb.track_id = t.id);

INSERT INTO lyric_breakdowns (id, track_id, lyric_excerpt, philosophical_analysis, tradition_id, is_curated)
SELECT
  'b1000004-0000-4000-8000-000000000004',
  t.id,
  'Post panic, I collect my thoughts before I speak',
  'Navy Blue turns post-anxiety introspection into existential ethics — the pause after panic as radical authenticity, refusing to perform strength before meaning is reconstructed.',
  pt.id,
  1
FROM tracks t
JOIN artists a ON a.id = t.artist_id
JOIN philosophical_traditions pt ON pt.name = 'Existentialism'
WHERE a.name = 'Navy Blue' AND t.title IN ('Post Panic!', 'Song of Sage')
  AND NOT EXISTS (SELECT 1 FROM lyric_breakdowns lb WHERE lb.track_id = t.id);

INSERT INTO lyric_breakdowns (id, track_id, lyric_excerpt, philosophical_analysis, tradition_id, is_curated)
SELECT
  'b1000005-0000-4000-8000-000000000005',
  t.id,
  'Fell out the sky like a meteor, crash landed in the parking lot',
  'woods and ELUCID render geopolitical paranoia as surrealist testimony — falling from the sky as the immigrant/diaspora condition under late capitalism, where survival is already a political argument.',
  pt.id,
  1
FROM tracks t
JOIN artists a ON a.id = t.artist_id
JOIN philosophical_traditions pt ON pt.name = 'Marxist Theory'
WHERE a.name = 'Armand Hammer' AND t.title IN ('Falling out the Sky', 'Falling Out the Sky')
  AND NOT EXISTS (SELECT 1 FROM lyric_breakdowns lb WHERE lb.track_id = t.id);

INSERT INTO lyric_breakdowns (id, track_id, lyric_excerpt, philosophical_analysis, tradition_id, is_curated)
SELECT
  'b1000006-0000-4000-8000-000000000006',
  t.id,
  'I was in the first forty-eight, trying to make my next move',
  'Boldy narrates the first forty-eight hours after arrest as measured Stoicism — no panic, no excess, just inventory of options under constraint. Detroit time moves slower because wisdom requires it.',
  pt.id,
  1
FROM tracks t
JOIN artists a ON a.id = t.artist_id
JOIN philosophical_traditions pt ON pt.name = 'Stoicism'
WHERE a.name = 'Boldy James' AND t.title = 'First 48 Freestyle'
  AND NOT EXISTS (SELECT 1 FROM lyric_breakdowns lb WHERE lb.track_id = t.id);
