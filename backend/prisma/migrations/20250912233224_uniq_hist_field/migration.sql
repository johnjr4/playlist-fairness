/*
  Warnings:

  - A unique constraint covering the columns `[playlistId,trackId,playedAt]` on the table `ListeningEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ListeningEvent_playlistId_trackId_playedAt_key" ON "public"."ListeningEvent"("playlistId", "trackId", "playedAt");
