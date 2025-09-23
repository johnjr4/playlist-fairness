// Safe translations of prisma schema

export interface UserFull {
    id: string
    spotifyUri: string
    spotifyId: string
    displayName: string | null
    imageUrl: string | null
    playlists: Playlist[]
    listeningHistory: ListeningEvent[]
    trackingStartTime: Date
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
    artist: Artist
    artistId: number
    album: Album
    albumId: number
    playlistTracks: PlaylistTrack[]
}
// Includes `artist` and `album`
export type TrackWithMeta = Pick<TrackFull, 'id' | 'spotifyUri' | 'name' | 'artist' | 'album'>
export type Track = Omit<TrackWithMeta, 'artist' | 'album'>

export interface PlaylistTrackFull {
    playlist: Playlist
    playlistId: number
    track: Track
    trackId: number
    playlistPosition: number
    currentlyOnPlaylist: boolean
    addedToPlaylistTime: Date | null
    trackingStartTime: Date
    trackingStopTime: Date | null
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

    playedAt: Date
}
export type ListeningEvent = Omit<ListeningEventFull, 'user' | 'userId' | 'playlistTrack'>
export type ListeningEventHist = Pick<ListeningEvent, 'playedAt'>

// Post body types

export interface PlaylistSyncBody {
    enabled: boolean,
}

// HTTP Response types

export interface HTTPResponseSuccess {
    success: true,
    message: string,
    data: any,
}

export interface HTTPResponseFailure {
    success: false,
    error: {
        message: string,
        code: string | undefined,
    }
}

export type HTTPResponse = HTTPResponseSuccess | HTTPResponseFailure;


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