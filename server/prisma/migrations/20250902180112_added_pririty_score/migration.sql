/*
  Warnings:

  - Added the required column `priorityScore` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Meeting" ADD COLUMN     "priorityScore" DOUBLE PRECISION NOT NULL;
