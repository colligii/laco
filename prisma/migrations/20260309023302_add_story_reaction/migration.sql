/*
  Warnings:

  - Added the required column `event_id` to the `story` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "reaction" AS ENUM ('Like', 'Smile', 'Clap', 'Heart');

-- AlterTable
ALTER TABLE "story" ADD COLUMN     "event_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "story_reaction" (
    "story_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reaction" "reaction" NOT NULL,

    CONSTRAINT "story_reaction_pkey" PRIMARY KEY ("story_id","user_id")
);

-- AddForeignKey
ALTER TABLE "story" ADD CONSTRAINT "story_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_reaction" ADD CONSTRAINT "story_reaction_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_reaction" ADD CONSTRAINT "story_reaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
