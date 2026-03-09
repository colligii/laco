/*
  Warnings:

  - You are about to drop the column `background_id` on the `event` table. All the data in the column will be lost.
  - Added the required column `horizontal_file_id` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vertical_file_id` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_background_id_fkey";

-- AlterTable
ALTER TABLE "event" DROP COLUMN "background_id",
ADD COLUMN     "horizontal_file_id" TEXT NOT NULL,
ADD COLUMN     "vertical_file_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_vertical_file_id_fkey" FOREIGN KEY ("vertical_file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_horizontal_file_id_fkey" FOREIGN KEY ("horizontal_file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
