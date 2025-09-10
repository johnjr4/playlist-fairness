import type { User } from "../generated/prisma/client.js";
import prisma from "../utils/prismaClient.js";

// Because of cascade behavior, deletes:
//      User
//      Playlists belonging to User
//      PlaylistTracks belonging to those playlists
//      ListeningEvents belonging to those PlaylistTracks
// Returns deleted user
export async function deleteUserAndOwnedData(userId: string): Promise<User | null> {
    try {
        const deletedUser = await prisma.user.delete({
            where: {
                id: userId,
            },
        });
        return deletedUser;
    } catch (err) {
        console.error("Failed to delete user", err);
        return null;
    }
}

// Delete all playlists in ids specified
// Returns num playlists deleted
export async function deletePlaylists(playlistIds: number[]): Promise<number> {
    if (playlistIds.length == 0) {
        console.warn("Empty array of playlist ids. No deletion will occur");
        return 0;
    }
    try {
        const deletedPlaylsits = await prisma.playlist.deleteMany({
            where: {
                id: {
                    in: playlistIds,
                },
            },
        });
        if (deletedPlaylsits.count !== playlistIds.length) {
            if (deletedPlaylsits.count > playlistIds.length) {
                console.error("Deleted more playlists than ids given (somehow)");
            } else {
                console.warn("Deleted fewer playlists than ids given. Did you pass in ids that were already deleted?");
            }
        }
        return deletedPlaylsits.count;
    } catch (err) {
        console.error("Failed to delete playlists", err);
        return 0;
    }
}

// Delete all tracks that are not referred to by any PlaylistTrack
// Returns num tracks deleted
export async function deleteOrphanedTracks(): Promise<number> {
    try {
        const deletedTracks = await prisma.track.deleteMany({
            where: {
                playlistTracks: {
                    none: {},   // No PlaylistTracks exist
                },
            }
        });
        if (deletedTracks.count == 0) {
            console.warn("No tracks deleted. Did you remember to delete the user first?");
        }
        return deletedTracks.count;
    } catch (err) {
        console.error("Failed to delete orphaned tracks", err);
        return 0;
    }
}

// Delete all Albums that are not referred to by any Track
export async function deleteOrphanedAlbums(): Promise<number> {
    try {
        const deletedAlbums = await prisma.album.deleteMany({
            where: {
                tracks: {
                    none: {},   // No Tracks exist
                }
            }
        });
        if (deletedAlbums.count == 0) {
            console.warn("No albums deleted. Did you remember to delete the tracks first?");
        }
        return deletedAlbums.count;
    } catch (err) {
        console.error("Failed to delete orphaned albums", err);
        return 0;
    }
}

export async function deleteOrphanedArtists(): Promise<number> {
    try {
        const deletedArtists = await prisma.artist.deleteMany({
            where: {
                tracks: {
                    none: {},
                },
                albums: {
                    none: {},
                },
            },
        });
        if (deletedArtists.count == 0) {
            console.warn("No artists deleted. Did you remember to delete the albums and tracks first?");
        }
        return deletedArtists.count;
    } catch (err) {
        console.error("Failed to delete orphaned artists", err);
        return 0;
    }
}