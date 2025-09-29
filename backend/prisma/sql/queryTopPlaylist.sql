-- @param {String} $1:ownerId
SELECT p.*, COALESCE(COUNT(le.id), 0) as plays, COALESCE(SUM(t."durationMs"), 0) as "totalMs"
FROM "Playlist" p
JOIN "PlaylistTrack" pt ON pt."playlistId" = p.id
JOIN "ListeningEvent" le ON (le."playlistId" = pt."playlistId" AND le."trackId" = pt."trackId")
JOIN "Track" t ON le."trackId" = t.id 
WHERE p."ownerId" = $1 -- Your user goes here
GROUP BY p.id
ORDER BY "totalMs" DESC
LIMIT 1;
