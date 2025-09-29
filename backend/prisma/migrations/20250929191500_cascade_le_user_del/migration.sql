-- DropForeignKey
ALTER TABLE "public"."ListeningEvent" DROP CONSTRAINT "ListeningEvent_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ListeningEvent" ADD CONSTRAINT "ListeningEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
