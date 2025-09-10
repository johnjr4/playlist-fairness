/*
  Warnings:

  - You are about to drop the column `image` on the `Artist` table. All the data in the column will be lost.
  - Added the required column `name` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Artist" DROP COLUMN "image",
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."Playlist" ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
