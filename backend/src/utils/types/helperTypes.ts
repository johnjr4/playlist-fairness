import type { Playlist, User } from "../../generated/prisma/client.js";
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
    redirect?: string,
}

declare module 'express' {
    interface Request {
        user?: User
    }
}

// express-session stuff

export type SessionUser = Pick<User, 'id' | 'spotifyUri'>

declare module 'express-session' {
    interface SessionData {
        user: SessionUser,
    }
}

// Nasty query business

export interface NullableBigIntListeningStat {
    plays: bigint | null,
    totalMs: bigint | null,
}