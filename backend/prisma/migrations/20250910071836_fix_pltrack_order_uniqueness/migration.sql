/*
  Warnings:

  - A unique constraint covering the columns `[playlistId,playlistPosition]` on the table `PlaylistTrack` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."PlaylistTrack_playlistPosition_key";

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTrack_playlistId_playlistPosition_key" ON "public"."PlaylistTrack"("playlistId", "playlistPosition");
