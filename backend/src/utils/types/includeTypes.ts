import type { Prisma } from "../../generated/prisma/client.js";
import prisma from "../prismaClient.js";

const trackBasicFields = {
    id: true,
    spotifyUri: true,
    name: true,
    durationMs: true,
    artistId: true,
} as const;
export const trackWithMetaArgs = {
    select: {
        ...trackBasicFields,
        album: true,
        artist: true,
    }
} as const;
export type TrackWithMeta = Prisma.TrackGetPayload<typeof trackWithMetaArgs>


const playlistTrackBasicFields = {
    playlistPosition: true,
    currentlyOnPlaylist: true,
    addedToPlaylistTime: true,
    trackingStartTime: true,
    trackingStopTime: true,
} as const;
export const playlistTrackWithMetaArgs = {
    select: {
        ...playlistTrackBasicFields,
        track: trackWithMetaArgs,
    }
} as const;
export type PlaylistTrackWithMeta = Prisma.PlaylistTrackGetPayload<typeof playlistTrackWithMetaArgs>

export const playlistTrackHistArgs = {
    select: {
        ...playlistTrackBasicFields,
        track: trackWithMetaArgs,
        listeningEvents: {
            select: {
                playedAt: true,
            },
        },
    }
} as const;
export type PlaylistTrackHist = Prisma.PlaylistTrackGetPayload<typeof playlistTrackHistArgs>

export const userFullArgs = {
    include: {
        playlists: true,
        listeningHistory: true,
    }
}
export type UserFull = Prisma.UserGetPayload<typeof userFullArgs>


export const playlistFullArgs = {
    include: {
        tracks: {
            ...playlistTrackWithMetaArgs,
            orderBy: {
                playlistPosition: "asc",
            }
        }
    },
} as const;
export type PlaylistFull = Prisma.PlaylistGetPayload<typeof playlistFullArgs>;


export const playlistHistArgs = {
    include: {
        tracks: {
            ...playlistTrackHistArgs,
            orderBy: {
                playlistPosition: "asc",
            }
        }
    },
} as const;
export type PlaylistHist = Prisma.PlaylistGetPayload<typeof playlistHistArgs>;

const albumBasicFields = {
    id: true,
    spotifyUri: true,
    name: true,
    coverUrl: true,
    artistId: true,
}
export const albumFullArgs = {
    select: {
        ...albumBasicFields,
        tracks: {
            select: trackBasicFields,
        },
        artist: true,
    }
} as const;
export type AlbumFull = Prisma.AlbumGetPayload<typeof albumFullArgs>;

export const artistFullArgs = {
    include: {
        tracks: {
            select: trackBasicFields
        },
        albums: {
            select: albumBasicFields
        },
    }
} as const;
export type ArtistFull = Prisma.ArtistGetPayload<typeof artistFullArgs>


export const trackFullArgs = {
    include: {
        artist: true,
        album: {
            select: albumBasicFields,
        },
        playlistTracks: {
            select: {
                ...playlistTrackBasicFields,
                playlistId: true,
                trackId: true,
            }
        }
    }
} as const;
export type TrackFull = Prisma.TrackGetPayload<typeof trackFullArgs>

export type PlaylistTrackFull = Prisma.PlaylistTrackGetPayload<{
    include: {
        playlist: true,
        track: true,
        listeningEvents: true,
    }
}>

export type ListeningEventFull = Prisma.ListeningEventGetPayload<{
    include: {
        user: true,
        playlistTrack: true,
    }
}>