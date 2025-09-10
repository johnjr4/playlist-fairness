/*
  Warnings:

  - Added the required column `spotifySnapshotId` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Playlist" ADD COLUMN     "spotifySnapshotId" TEXT NOT NULL;
