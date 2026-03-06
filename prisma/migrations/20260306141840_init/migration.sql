-- CreateEnum
CREATE TYPE "provider" AS ENUM ('Local', 'Google', 'Apple');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('Admin', 'User');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "type" "UserType" NOT NULL DEFAULT 'User',
    "password" VARCHAR(255),
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "provider" "provider" NOT NULL DEFAULT 'Local',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);
