-- CreateEnum
CREATE TYPE "file_type" AS ENUM ('Video', 'Photo');

-- AlterTable
ALTER TABLE "file" ADD COLUMN     "type" "file_type";
