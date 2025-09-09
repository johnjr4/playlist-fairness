-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "trackingStartTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Playlist" (
    "id" SERIAL NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Album" (
    "id" SERIAL NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coverUrl" TEXT,
    "artistId" INTEGER NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Artist" (
    "id" SERIAL NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Track" (
    "id" SERIAL NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artistId" INTEGER NOT NULL,
    "albumId" INTEGER NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlaylistTrack" (
    "playlistId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "playlistPosition" INTEGER NOT NULL,
    "currentlyOnPlaylist" BOOLEAN NOT NULL DEFAULT true,
    "addedToPlaylistTime" TIMESTAMP(3) NOT NULL,
    "trackingStartTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackingStopTime" TIMESTAMP(3),

    CONSTRAINT "PlaylistTrack_pkey" PRIMARY KEY ("playlistId","trackId")
);

-- CreateTable
CREATE TABLE "public"."ListeningEvent" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "playlistId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "wasShuffle" BOOLEAN NOT NULL,

    CONSTRAINT "ListeningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_spotifyId_key" ON "public"."User"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_spotifyId_key" ON "public"."Playlist"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Album_spotifyId_key" ON "public"."Album"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_spotifyId_key" ON "public"."Artist"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_spotifyId_key" ON "public"."Track"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTrack_playlistPosition_key" ON "public"."PlaylistTrack"("playlistPosition");

-- CreateIndex
CREATE INDEX "ListeningEvent_userId_playedAt_idx" ON "public"."ListeningEvent"("userId", "playedAt");

-- CreateIndex
CREATE INDEX "ListeningEvent_playlistId_trackId_idx" ON "public"."ListeningEvent"("playlistId", "trackId");

-- AddForeignKey
ALTER TABLE "public"."Playlist" ADD CONSTRAINT "Playlist_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Album" ADD CONSTRAINT "Album_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Track" ADD CONSTRAINT "Track_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Track" ADD CONSTRAINT "Track_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "public"."Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ListeningEvent" ADD CONSTRAINT "ListeningEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ListeningEvent" ADD CONSTRAINT "ListeningEvent_playlistId_trackId_fkey" FOREIGN KEY ("playlistId", "trackId") REFERENCES "public"."PlaylistTrack"("playlistId", "trackId") ON DELETE CASCADE ON UPDATE CASCADE;
