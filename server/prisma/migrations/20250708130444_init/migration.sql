-- CreateEnum
CREATE TYPE "CodeTypes" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isverified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "Verificationcode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "types" "CodeTypes" NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Verificationcode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Verificationcode_userId_key" ON "Verificationcode"("userId");

-- AddForeignKey
ALTER TABLE "Verificationcode" ADD CONSTRAINT "Verificationcode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
