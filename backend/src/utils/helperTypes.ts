import type { Playlist, User } from "../generated/prisma/client.js";
import type * as Spotify from "./spotifyTypes.js";

export interface BundledSpotifyPlaylistTracks {
    playlist: Playlist,
    spotifyPlaylistTracks: Spotify.PlaylistTrackObject[],
}

// Express stuff

export interface AuthCallbackReqQuery {
    code?: string,
    state?: string,
    verifier?: string,
}

// express-session stuff

export type SessionUser = Pick<User, 'id' | 'spotifyUri'>

declare module 'express-session' {
    interface SessionData {
        user: SessionUser,
    }
}