import * as Public from "spotifair";
import type { Album, Artist, ListeningEvent, Playlist, PlaylistTrack, Track, User } from "../../generated/prisma/client.js";
import type { AlbumFull, ArtistFull, ListeningEventFull, PlaylistFull, PlaylistHist, PlaylistTrackFull, PlaylistTrackHist, PlaylistTrackWithMeta, TrackFull, TrackWithMeta, UserFull } from "./includeTypes.js";
import type { NullableBigIntListeningStat } from "./helperTypes.js";

export function userToPublic(user: User): Public.User {
    const { trackingStartTime } = user;
    return { ...user, trackingStartTime: trackingStartTime.toISOString() };
}

export function userToPublicFull(user: UserFull): Public.UserFull {
    const { playlists, listeningHistory } = user;
    const convertedHistory = listeningHistory.map(le => listeningEventToPublic(le));
    return { ...user, ...userToPublic(user), playlists, listeningHistory: convertedHistory };
}

export function playlistToPublic(playlist: Playlist): Public.Playlist {
    return playlist;
}

export function playlistToPublicFull(playlist: PlaylistFull): Public.PlaylistFull {
    const { tracks } = playlist;
    const convertedTracks = tracks.map(t => playlistTrackToPublicWithMeta(t));
    return { ...playlist, tracks: convertedTracks };
}

export function playlistToPublicHist(playlist: PlaylistHist): Public.PlaylistHist {
    const { tracks } = playlist;
    const convertedTracks = tracks.map(t => playlistTrackToPublicHist(t));
    return { ...playlist, tracks: convertedTracks };
}


export function albumToPublic(album: Album): Public.Album {
    return album;
}

export function albumToPublicFull(album: AlbumFull): Public.AlbumFull {
    return album;
}


export function artistToPublic(artist: Artist): Public.Artist {
    return artist;
}

export function artistToPublicFull(artist: ArtistFull): Public.ArtistFull {
    return artist;
}


export function trackToPublic(track: Track): Public.Track {
    return track;
}

export function trackToPublicFull(track: TrackFull): Public.TrackFull {
    const { playlistTracks } = track;
    const convertedTracks = playlistTracks.map(pt => playlistTrackToPublic(pt));
    return { ...track, playlistTracks: convertedTracks };
}


function convertPlaylistTrackTimestamps(playlistTrackTimestamps: {
    trackingStartTime: Date,
    trackingStopTime: Date | null,
    addedToPlaylistTime: Date | null,
}) {
    const { trackingStartTime, trackingStopTime, addedToPlaylistTime } = playlistTrackTimestamps;
    return {
        trackingStartTime: trackingStartTime.toISOString(),
        trackingStopTime: trackingStopTime ? trackingStopTime?.toISOString() : null,
        addedToPlaylistTime: addedToPlaylistTime ? addedToPlaylistTime?.toISOString() : null,
    }
}

export function playlistTrackToPublic(playlistTrack: PlaylistTrack): Public.PlaylistTrack {
    return { ...playlistTrack, ...convertPlaylistTrackTimestamps(playlistTrack) };
}

export function playlistTrackToPublicFull(playlistTrack: PlaylistTrackFull): Public.PlaylistTrackFull {
    const { listeningEvents } = playlistTrack;
    const convertedListeningEvents = listeningEvents.map(le => listeningEventToPublic(le));
    return { ...playlistTrack, ...convertPlaylistTrackTimestamps(playlistTrack), listeningEvents: convertedListeningEvents };
}

export function playlistTrackToPublicWithMeta(playlistTrack: PlaylistTrackWithMeta): Public.PlaylistTrackWithMeta {
    return { ...playlistTrack, ...convertPlaylistTrackTimestamps(playlistTrack) };
}

export function playlistTrackToPublicHist(playlistTrack: PlaylistTrackHist): Public.PlaylistTrackHist {
    const { listeningEvents } = playlistTrack;
    const convertedListeningEvents = listeningEvents.map(le => ({ playedAt: le.playedAt.toISOString() }));
    return { ...playlistTrack, ...convertPlaylistTrackTimestamps(playlistTrack), listeningEvents: convertedListeningEvents };
}


export function listeningEventToPublic(listeningEvent: ListeningEvent): Public.ListeningEvent {
    const { playedAt } = listeningEvent;
    return { ...listeningEvent, playedAt: playedAt.toISOString() };
}

export function listeningEventToPublicFull(listeningEvent: ListeningEventFull): Public.ListeningEventFull {
    const { user, playlistTrack } = listeningEvent;
    return { ...listeningEvent, ...listeningEventToPublic(listeningEvent), user: userToPublic(user), playlistTrack: playlistTrackToPublic(playlistTrack) };
}

export function nullableListeningStatToPublic(nullableListeningStat: NullableBigIntListeningStat): Public.ListeningStat {
    const { plays, totalMs } = nullableListeningStat;
    const fixedPlays = (plays ? Number(plays) : 0);
    const fixedTotalMs = (totalMs ? Number(totalMs) : 0);
    return { plays: fixedPlays, totalMs: fixedTotalMs };
}