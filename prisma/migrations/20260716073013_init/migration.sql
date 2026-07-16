/*
  Warnings:

  - The values [REFUNDED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [INACTIVE] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `date` on the `availability` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `availability` table. All the data in the column will be lost.
  - You are about to drop the column `bookingDate` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentIntentId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `payments` table. All the data in the column will be lost.
  - The `provider` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `estimatedHours` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `technician_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `averageRating` on the `technician_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `completedJobs` on the `technician_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyRate` on the `technician_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `technician_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `technician_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `technician_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `users` table. All the data in the column will be lost.
  - Added the required column `dayOfWeek` to the `availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledAt` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Made the column `transactionId` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `method` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'TECHNICIAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'SSLCOMMERZ');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
ALTER TABLE "public"."payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'BANNED');
ALTER TABLE "public"."users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_technicianId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_userId_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_technicianId_fkey";

-- AlterTable
ALTER TABLE "availability" DROP COLUMN "date",
DROP COLUMN "status",
ADD COLUMN     "dayOfWeek" INTEGER NOT NULL,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "bookingDate",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "totalAmount",
ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "icon",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "currency",
DROP COLUMN "paymentIntentId",
DROP COLUMN "userId",
ALTER COLUMN "transactionId" SET NOT NULL,
DROP COLUMN "provider",
ADD COLUMN     "provider" TEXT,
DROP COLUMN "method",
ADD COLUMN     "method" "PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "estimatedHours",
DROP COLUMN "isActive",
ADD COLUMN     "duration" INTEGER,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "technician_profiles" DROP COLUMN "address",
DROP COLUMN "averageRating",
DROP COLUMN "completedJobs",
DROP COLUMN "hourlyRate",
DROP COLUMN "isAvailable",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "experience" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
DROP COLUMN "isVerified",
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- DropEnum
DROP TYPE "AvailabilityStatus";

-- DropEnum
DROP TYPE "PaymentProvider";

-- DropEnum
DROP TYPE "UserRole";

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technician_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
