-- @param {String} $1:userId
SELECT SUM(t."durationMs") as "totalMs", COUNT(DISTINCT le.*) as plays
FROM "ListeningEvent" le
JOIN "PlaylistTrack" pt ON (le."playlistId" = pt."playlistId" AND le."trackId" = pt."trackId")
JOIN "Track" t ON pt."trackId" = t.id
WHERE le."userId" = $1