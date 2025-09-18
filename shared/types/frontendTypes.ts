// Safe translations of prisma schema

export interface UserFull {
    id: string
    spotifyUri: string
    spotifyId: string
    displayName: string | null
    imageUrl: string | null
    playlists: Playlist[]
    trackingStartTime: Date
}
export type User = Omit<UserFull, 'playlists'>

export interface PlaylistFull {
    id: number
    name: string
    coverUrl: string | null
    spotifyId: string
    spotifyUri: string
    owner: User
    ownerId: string
    tracks: PlaylistTrack[]
}
export type Playlist = Omit<PlaylistFull, 'owner' | 'tracks'>

export interface AlbumFull {
    id: number
    spotifyUri: string
    name: string
    coverUrl: string | null
    tracks: Track[]
    artist: Artist
    artistId: number
}
export type Album = Omit<AlbumFull, 'tracks' | 'artist'>;

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
export type Track = Omit<TrackFull, 'artist' | 'album' | 'playlistTracks'>

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
export type PlaylistTrack = Omit<PlaylistTrackFull, 'playlist' | 'track' | 'listeningEvents'>

export interface ListeningEventFull {
    id: number
    user: User
    userId: string

    playlistId: number
    trackId: number
    playlistTrack: PlaylistTrack

    playedAt: Date
}
export type ListeningEvent = Omit<ListeningEventFull, 'user' | 'playlistTrack'>