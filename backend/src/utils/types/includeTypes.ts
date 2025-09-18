import type { Prisma } from "../../generated/prisma/client.js";
import prisma from "../prismaClient.js";

export type TrackWithMeta = Prisma.TrackGetPayload<{
    select: {
        id: true,
        spotifyUri: true,
        name: true,
        album: true,
        artist: true,
    }
}>

export type PlaylistTrackWithMeta = Prisma.PlaylistTrackGetPayload<{
    select: {
        playlistPosition: true,
        currentlyOnPlaylist: true,
        addedToPlaylistTime: true,
        trackingStartTime: true,
        trackingStopTime: true,
        track: {
            select: {
                id: true,
                spotifyUri: true,
                name: true,
                album: true,
                artist: true,
            }
        }
    }
}>

export type UserFull = Prisma.UserGetPayload<{
    include: {
        playlists: true,
        listeningHistory: true,
    }
}>

export type PlaylistFull = Prisma.PlaylistGetPayload<{
    include: {
        tracks: {
            select: {
                track: {
                    include: {
                        album: true,
                        artist: true,
                    }
                }
                playlistPosition: true,
                currentlyOnPlaylist: true,
                addedToPlaylistTime: true,
                trackingStartTime: true,
                trackingStopTime: true,
            },
        }
    }
}>

export type PlaylistHist = Prisma.PlaylistGetPayload<{
    include: {
        tracks: {
            select: {
                track: {
                    include: {
                        album: true,
                        artist: true,
                    }
                }
                playlistPosition: true,
                currentlyOnPlaylist: true,
                addedToPlaylistTime: true,
                trackingStartTime: true,
                trackingStopTime: true,
                listeningEvents: {
                    select: {
                        playedAt: true,
                    }
                },
            },
        }
    }
}>

export type AlbumFull = Prisma.AlbumGetPayload<{
    include: {
        tracks: true,
        artist: true,
    }
}>

export type ArtistFull = Prisma.ArtistGetPayload<{
    include: {
        tracks: true,
        albums: true,
    }
}>

export type TrackFull = Prisma.TrackGetPayload<{
    include: {
        artist: true,
        album: true,
        playlistTracks: true,
    }
}>

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