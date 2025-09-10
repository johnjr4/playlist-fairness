import type { Playlist } from "../generated/prisma/client.js";
import type * as Spotify from "./spotifyTypes.js";

export interface BundledSpotifyPlaylistTracks {
    playlist: Playlist,
    spotifyPlaylistTracks: Spotify.PlaylistTrackObject[],
}