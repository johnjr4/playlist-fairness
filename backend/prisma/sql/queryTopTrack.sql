-- @param {String} $1:ownerId
SELECT t.*, COUNT(DISTINCT le.id) as "plays"
FROM "Track" t
JOIN "PlaylistTrack" pt ON pt."trackId" = t.id
JOIN "ListeningEvent" le ON (pt."trackId" = le."trackId" AND pt."playlistId" = le."playlistId")
WHERE le."userId" = $1
GROUP BY t.id
ORDER BY plays DESC
LIMIT 1