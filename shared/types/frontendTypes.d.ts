// Safe translations of prisma schema

export interface UserFull {
    id: string
    spotifyUri: string
    spotifyId: string
    displayName: string | null
    imageUrl: string | null
    playlists: Playlist[]
    listeningHistory: ListeningEvent[]
    trackingStartTime: string
    country: string | null
}
export type User = Omit<UserFull, 'playlists' | 'listeningHistory'>

export interface PlaylistFull {
    id: number
    name: string
    coverUrl: string | null
    spotifyId: string
    spotifyUri: string
    ownerId: string
    syncEnabled: boolean,
    tracks: PlaylistTrackWithMeta[]
}
export type Playlist = Omit<PlaylistFull, 'tracks'>
export type PlaylistHist = Playlist & {
    tracks: PlaylistTrackHist[]
}
export type PlaylistStat = {
    numTracks: number,
    totalMs: number,
};
export type TopPlaylist = Playlist & { listening: ListeningStat }
export type PlaylistWithStats = Playlist & { stats: PlaylistStat }

export interface AlbumFull {
    id: number
    spotifyUri: string
    name: string
    coverUrl: string | null
    tracks: Track[]
    artist: Artist
    artistId: number
}
export type Album = Omit<AlbumFull, 'tracks' | 'artist' | 'artistId'>;

export interface ArtistFull {
    id: number
    spotifyUri: string
    name: string
    tracks: Track[]
    albums: Album[]
}
export type Artist = Omit<ArtistFull, 'tracks' | 'albums'>

export interface TrackFull {
    id: number
    spotifyUri: string
    name: string
    durationMs: number,
    artist: Artist
    artistId: number
    album: Album
    albumId: number
    playlistTracks: PlaylistTrack[]
}
// Includes `artist` and `album`
export type TrackWithMeta = Pick<TrackFull, 'id' | 'spotifyUri' | 'name' | 'artist' | 'album' | 'durationMs'>
export type Track = Omit<TrackWithMeta, 'artist' | 'album'>
export type TrackStat = Track & Pick<ListeningStat, 'plays'>;

export interface PlaylistTrackFull {
    playlist: Playlist
    playlistId: number
    track: Track
    trackId: number
    playlistPosition: number
    currentlyOnPlaylist: boolean
    addedToPlaylistTime: string | null
    trackingStartTime: string
    trackingStopTime: string | null
    listeningEvents: ListeningEvent[]
}
// Includes `track` with album and artist

export type PlaylistTrackWithMeta = Pick<PlaylistTrackFull, 'playlistPosition' | 'currentlyOnPlaylist' | 'addedToPlaylistTime' | 'trackingStartTime' | 'trackingStopTime'> & {
    track: TrackWithMeta
}
export type PlaylistTrack = Omit<PlaylistTrackWithMeta, 'track'>
export type PlaylistTrackHist = PlaylistTrackWithMeta & {
    listeningEvents: ListeningEventHist[]
}

export interface ListeningEventFull {
    id: number
    user: User
    userId: string

    playlistId: number
    trackId: number
    playlistTrack: PlaylistTrack

    playedAt: string
}
export type ListeningEvent = Omit<ListeningEventFull, 'user' | 'userId' | 'playlistTrack'>
export type ListeningEventHist = Pick<ListeningEvent, 'playedAt'>

// Post body types

export interface PlaylistSyncBody {
    enabled: boolean,
}

// HTTP Response types

export interface HTTPResponseSuccess<T> {
    success: true,
    message: string,
    data: T,
}

export interface HTTPResponseFailure {
    success: false,
    error: {
        message: string,
        code: string | undefined,
    }
}

export type HTTPResponse<T> = HTTPResponseSuccess<T> | HTTPResponseFailure;


// etc.

export interface PlaylistSyncRes {
    enabled: boolean;
    counts: PlaylistSyncCounts;
}

export interface PlaylistSyncCounts {
    numPlaylistTracks: number;
    numTracks: number;
    numAlbums: number;
    numArtists: number;
}

export interface ListeningStat {
    totalMs: number,
    plays: number,
}

export interface UserStats {
    playlists: {
        total: number;
        synced: number;
        top: TopPlaylist | null;
    };
    listens: ListeningStat;
    tracks: {
        total: number;
        top: TrackStat | null;
    }
}