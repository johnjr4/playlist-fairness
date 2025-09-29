import * as Public from "spotifair";
import type { Album, Artist, ListeningEvent, Playlist, PlaylistTrack, Track, User } from "../../generated/prisma/client.js";
import type { AlbumFull, ArtistFull, ListeningEventFull, PlaylistFull, PlaylistHist, PlaylistTrackFull, TrackFull, UserFull } from "./includeTypes.js";
import type { NullableBigIntListeningStat } from "./helperTypes.js";

export function userToPublic(user: User): Public.User {
    const { id, spotifyUri, spotifyId, displayName, imageUrl, trackingStartTime } = user;
    return { id, spotifyUri, spotifyId, displayName, imageUrl, trackingStartTime };
}

export function userToPublicFull(user: UserFull): Public.UserFull {
    const { id, spotifyUri, spotifyId, displayName, imageUrl, playlists, listeningHistory, trackingStartTime } = user;
    return { id, spotifyUri, spotifyId, displayName, imageUrl, playlists, listeningHistory, trackingStartTime };
}

export function playlistToPublic(playlist: Playlist): Public.Playlist {
    const { id, name, coverUrl, spotifyId, spotifyUri, ownerId, syncEnabled } = playlist;
    return { id, name, coverUrl, spotifyId, spotifyUri, ownerId, syncEnabled };
}

export function playlistToPublicFull(playlist: PlaylistFull): Public.PlaylistFull {
    const { id, name, coverUrl, spotifyId, spotifyUri, ownerId, tracks, syncEnabled } = playlist;
    return { id, name, coverUrl, spotifyId, spotifyUri, ownerId, tracks, syncEnabled };
}

export function playlistToPublicHist(playlist: PlaylistHist): Public.PlaylistHist {
    const { name, id, spotifyUri, spotifyId, coverUrl, ownerId, tracks, syncEnabled } = playlist;
    return { name, id, spotifyUri, spotifyId, coverUrl, ownerId, tracks, syncEnabled };
}


export function albumToPublic(album: Album): Public.Album {
    const { id, spotifyUri, name, coverUrl } = album;
    return { id, spotifyUri, name, coverUrl };
}

export function albumToPublicFull(album: AlbumFull): Public.AlbumFull {
    const { id, spotifyUri, name, coverUrl, tracks, artist, artistId } = album;
    return { id, spotifyUri, name, coverUrl, tracks, artist, artistId };
}


export function artistToPublic(artist: Artist): Public.Artist {
    const { id, spotifyUri, name } = artist;
    return { id, spotifyUri, name };
}

export function artistToPublicFull(artist: ArtistFull): Public.ArtistFull {
    const { id, spotifyUri, name, tracks, albums } = artist;
    return { id, spotifyUri, name, tracks, albums };
}


export function trackToPublic(track: Track): Public.Track {
    const { id, spotifyUri, name } = track;
    return { id, spotifyUri, name };
}

export function trackToPublicFull(track: TrackFull): Public.TrackFull {
    const { id, spotifyUri, name, artist, artistId, album, albumId, playlistTracks } = track;
    return { id, spotifyUri, name, artist, artistId, album, albumId, playlistTracks };
}


export function playlistTrackToPublic(playlistTrack: PlaylistTrack): Public.PlaylistTrack {
    const { playlistPosition, currentlyOnPlaylist, addedToPlaylistTime, trackingStartTime, trackingStopTime } = playlistTrack;
    return { playlistPosition, currentlyOnPlaylist, addedToPlaylistTime, trackingStartTime, trackingStopTime };
}

export function playlistTrackToPublicFull(playlistTrack: PlaylistTrackFull): Public.PlaylistTrackFull {
    const { playlist, playlistId, track, trackId, playlistPosition, currentlyOnPlaylist, addedToPlaylistTime, trackingStartTime, trackingStopTime, listeningEvents } = playlistTrack;
    return { playlist, playlistId, track, trackId, playlistPosition, currentlyOnPlaylist, addedToPlaylistTime, trackingStartTime, trackingStopTime, listeningEvents };
}


export function listeningEventToPublic(listeningEvent: ListeningEvent): Public.ListeningEvent {
    const { id, playlistId, trackId, playedAt } = listeningEvent;
    return { id, playlistId, trackId, playedAt };
}

export function listeningEventToPublicFull(listeningEvent: ListeningEventFull): Public.ListeningEventFull {
    const { id, user, userId, playlistId, trackId, playlistTrack, playedAt } = listeningEvent;
    return { id, user, userId, playlistId, trackId, playlistTrack, playedAt };
}

export function nullableListeningStatToPublic(nullableListeningStat: NullableBigIntListeningStat): Public.ListeningStat {
    const { plays, totalMs } = nullableListeningStat;
    const fixedPlays = (plays ? Number(plays) : 0);
    const fixedTotalMs = (totalMs ? Number(totalMs) : 0);
    return { plays: fixedPlays, totalMs: fixedTotalMs };
}