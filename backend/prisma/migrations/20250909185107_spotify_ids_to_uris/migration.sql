/*
  Warnings:

  - You are about to drop the column `spotifyId` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `spotifyId` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `spotifyId` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `spotifyId` on the `Track` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[spotifyUri]` on the table `Album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spotifyUri]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spotifyUri]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spotifyUri]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spotifyUri]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spotifyUri` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotifyUri` to the `Artist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotifyUri` to the `Playlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotifyUri` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotifyUri` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Album_spotifyId_key";

-- DropIndex
DROP INDEX "public"."Artist_spotifyId_key";

-- DropIndex
DROP INDEX "public"."Playlist_spotifyId_key";

-- DropIndex
DROP INDEX "public"."Track_spotifyId_key";

-- AlterTable
ALTER TABLE "public"."Album" DROP COLUMN "spotifyId",
ADD COLUMN     "spotifyUri" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Artist" DROP COLUMN "spotifyId",
ADD COLUMN     "spotifyUri" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Playlist" DROP COLUMN "spotifyId",
ADD COLUMN     "spotifyUri" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Track" DROP COLUMN "spotifyId",
ADD COLUMN     "spotifyUri" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "spotifyUri" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Album_spotifyUri_key" ON "public"."Album"("spotifyUri");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_spotifyUri_key" ON "public"."Artist"("spotifyUri");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_spotifyUri_key" ON "public"."Playlist"("spotifyUri");

-- CreateIndex
CREATE UNIQUE INDEX "Track_spotifyUri_key" ON "public"."Track"("spotifyUri");

-- CreateIndex
CREATE UNIQUE INDEX "User_spotifyUri_key" ON "public"."User"("spotifyUri");
