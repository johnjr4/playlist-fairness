import type { User } from "../generated/prisma/client.js";
import prisma from "../utils/prismaClient.js";

// Because of cascade behavior, deletes:
//      User
//      Playlists belonging to User
//      PlaylistTracks belonging to those playlists
//      ListeningEvents belonging to those PlaylistTracks
// Then calls deleteOrphanedSyncData to delete now unneccessary:
//      Tracks referenced only by deleted PlaylistTracks
//      Albums referenced only by those Tracks
//      Artists referenced only by those Tracks and Albums
// Returns deleted user
export async function deleteUserAndOwnedData(userId: string): Promise<User | null> {
    try {
        const deletedUser = await prisma.user.delete({
            where: {
                id: userId,
            },
        });
        await deleteOrphanedSyncData();
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

// Deletes PlaylistTracks (which cascades to listeningEvents) and orphaned data
export async function unsyncPlaylist(playlistId: number) {
    let ptCount = 0;
    try {
        const playlistTracks = await prisma.playlistTrack.deleteMany({
            where: {
                playlistId: playlistId,
            }
        });
        ptCount = playlistTracks.count;
        if (ptCount === 0) {
            console.warn("No PlaylistTracks deleted. Did your playlist have any tracks?");
            return { numPlaylistTracks: 0, numTracks: 0, numAlbums: 0, numArtists: 0 };
        }
        const { numTracks, numAlbums, numArtists } = await deleteOrphanedSyncData();
        return { numPlaylistTracks: ptCount, numTracks, numAlbums, numArtists };
    } catch (err) {
        console.error("Failed to unsync playlist", err);
        return { numPlaylistTracks: ptCount, numTracks: 0, numAlbums: 0, numArtists: 0 };
    }
}

export async function deleteOrphanedSyncData() {
    try {
        // Has to be in this order
        const [tracks, albums, artists] = await prisma.$transaction([
            prisma.track.deleteMany({
                where: {
                    playlistTracks: {
                        none: {},   // No PlaylistTracks exist
                    },
                }
            }),
            prisma.album.deleteMany({
                where: {
                    tracks: {
                        none: {},   // No Tracks exist
                    }
                }
            }),
            prisma.artist.deleteMany({
                where: {
                    tracks: {
                        none: {},   // No Tracks exist
                    },
                    albums: {
                        none: {},   // No Albums exist
                    },
                },
            }),
        ]);
        if (tracks.count === 0 && albums.count === 0 && artists.count === 0) {
            console.warn("No orphaned data deleted. Did you remember to delete PlaylistTracks first?");
        }
        return { numTracks: tracks.count, numAlbums: albums.count, numArtists: artists.count }
    } catch (err) {
        console.error("Failed to delete orphaned data", err);
        return { numTracks: 0, numAlbums: 0, numArtists: 0 }
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