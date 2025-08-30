/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('AVAILABLE', 'BUSY', 'BREAK', 'PREFERRED');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_userId_fkey";

-- DropTable
DROP TABLE "Event";

-- CreateTable
CREATE TABLE "Meeting" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "deadline" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "status" "MeetingStatus" NOT NULL DEFAULT 'PENDING',
    "teamId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingUser" (
    "id" SERIAL NOT NULL,
    "meetingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MeetingUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndividualSchedule" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "type" "ScheduleType" NOT NULL DEFAULT 'AVAILABLE',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndividualSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedTime" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Busy',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockedTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingUser_meetingId_userId_key" ON "MeetingUser"("meetingId", "userId");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingUser" ADD CONSTRAINT "MeetingUser_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingUser" ADD CONSTRAINT "MeetingUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndividualSchedule" ADD CONSTRAINT "IndividualSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedTime" ADD CONSTRAINT "BlockedTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
