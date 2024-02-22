/*
  Warnings:

  - You are about to drop the column `lenght` on the `Dimensions` table. All the data in the column will be lost.
  - Added the required column `length` to the `Dimensions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Dimensions` DROP COLUMN `lenght`,
    ADD COLUMN `length` DOUBLE NOT NULL;
