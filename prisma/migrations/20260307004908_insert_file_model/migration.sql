/*
  Warnings:

  - A unique constraint covering the columns `[avatarId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "avatarId" TEXT;

-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_avatarId_key" ON "user"("avatarId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
