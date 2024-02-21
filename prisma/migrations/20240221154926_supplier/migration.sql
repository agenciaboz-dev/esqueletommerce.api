/*
  Warnings:

  - A unique constraint covering the columns `[contact_id]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Made the column `contact_id` on table `Supplier` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Contact` DROP FOREIGN KEY `Contact_supplier_id_fkey`;

-- AlterTable
ALTER TABLE `Supplier` MODIFY `contact_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_contact_id_key` ON `Supplier`(`contact_id`);

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
