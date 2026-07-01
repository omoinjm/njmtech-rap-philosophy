-- Fix placeholder Spotify track IDs and add artist profile images.

UPDATE artists SET image_url = 'https://r2.theaudiodb.com/images/media/artist/thumb/rza-5051ece0eadfa.jpg'
WHERE name = 'The RZA';

UPDATE artists SET image_url = 'https://r2.theaudiodb.com/images/media/artist/thumb/xwsypt1409025539.jpg'
WHERE name = 'Roc Marciano';

UPDATE artists SET image_url = 'https://r2.theaudiodb.com/images/media/artist/thumb/wruqww1361058448.jpg'
WHERE name = 'Immortal Technique';

UPDATE artists SET image_url = 'https://r2.theaudiodb.com/images/media/artist/thumb/twqssw1587200347.jpg'
WHERE name = 'Westside Gunn';

UPDATE artists SET image_url = 'https://r2.theaudiodb.com/images/media/artist/thumb/n7oq9n1658631854.jpg'
WHERE name = 'Joey Bada$$';

UPDATE artists SET image_url = 'https://r2.theaudiodb.com/images/media/artist/thumb/tribe-called-quest-a-5012b67a6702e.jpg'
WHERE name = 'A Tribe Called Quest';

UPDATE artists SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Navy_Blue_performing_12.7.21.png'
WHERE name = 'Navy Blue';

UPDATE artists SET image_url = 'https://r2.theaudiodb.com/images/media/artist/thumb/qhj13a1696754751.jpg'
WHERE name = 'Armand Hammer';

UPDATE artists SET image_url = 'https://r2.theaudiodb.com/images/media/artist/thumb/z3w22k1689579549.jpg'
WHERE name = 'Boldy James';

UPDATE tracks SET spotify_track_id = '743mgbaWbrZEkofD66ZGR0'
WHERE title = 'Protect Ya Neck'
  AND artist_id IN (SELECT id FROM artists WHERE name = 'The RZA');

UPDATE tracks SET title = 'Snow', spotify_track_id = '78WpL30JbFhkbPoeprZ2fr'
WHERE title = 'Pimpstrumentals'
  AND artist_id IN (SELECT id FROM artists WHERE name = 'Roc Marciano');

UPDATE tracks SET spotify_track_id = '7MDUVH4ITohsIjdynRwCJp'
WHERE title = 'Dance with the Devil'
  AND artist_id IN (SELECT id FROM artists WHERE name = 'Immortal Technique');

UPDATE tracks SET spotify_track_id = '5sxRbu2Oi9lgmLO8taA3Rf'
WHERE title = '327'
  AND artist_id IN (SELECT id FROM artists WHERE name = 'Westside Gunn');

UPDATE tracks SET title = 'Waves', spotify_track_id = '3AM2ihc5RFzbC47eCpTg2I'
WHERE title = '1999'
  AND artist_id IN (SELECT id FROM artists WHERE name = 'Joey Bada$$');

UPDATE tracks SET spotify_track_id = '5q6pg1kvXfT7z5MqG0KKSs'
WHERE title = 'Can I Kick It?'
  AND artist_id IN (SELECT id FROM artists WHERE name = 'A Tribe Called Quest');

UPDATE tracks SET title = 'Post Panic!', spotify_track_id = '6uMqJQvja5YpIWqcGOLRoj'
WHERE title = 'Song of Sage'
  AND artist_id IN (SELECT id FROM artists WHERE name = 'Navy Blue');

UPDATE tracks SET title = 'Falling out the Sky', spotify_track_id = '1jvbeXQgI7SA47MaXXGixh', year = 2021
WHERE title IN ('Falling Out the Sky', 'Falling out the Sky')
  AND artist_id IN (SELECT id FROM artists WHERE name = 'Armand Hammer');

UPDATE tracks SET spotify_track_id = '30F9xlqPC7R9I4H4Qj3LAF'
WHERE title = 'First 48 Freestyle'
  AND artist_id IN (SELECT id FROM artists WHERE name = 'Boldy James');
