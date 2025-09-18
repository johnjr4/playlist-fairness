import type { Prisma } from "../../generated/prisma/client.js";
import prisma from "../prismaClient.js";

export type UserFull = Prisma.UserGetPayload<{
    include: {
        playlists: true,
        listeningHistory: true,
    }
}>

export type PlaylistFull = Prisma.PlaylistGetPayload<{
    include: {
        owner: true,
        tracks: true,
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