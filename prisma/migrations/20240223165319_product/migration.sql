/*
  Warnings:

  - Added the required column `cover_url` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `cover_url` VARCHAR(191) NOT NULL;
