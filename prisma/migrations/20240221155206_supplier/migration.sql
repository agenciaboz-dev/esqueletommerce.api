-- DropIndex
DROP INDEX `Contact_supplier_id_key` ON `Contact`;

-- AlterTable
ALTER TABLE `Contact` MODIFY `supplier_id` INTEGER NULL;
