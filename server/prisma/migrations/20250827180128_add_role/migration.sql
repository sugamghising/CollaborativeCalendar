/*
  Warnings:

  - Added the required column `role` to the `IndividualSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IndividualSchedule" ADD COLUMN     "role" TEXT NOT NULL;
