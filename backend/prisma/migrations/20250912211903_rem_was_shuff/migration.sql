/*
  Warnings:

  - You are about to drop the column `wasShuffle` on the `ListeningEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ListeningEvent" DROP COLUMN "wasShuffle";
