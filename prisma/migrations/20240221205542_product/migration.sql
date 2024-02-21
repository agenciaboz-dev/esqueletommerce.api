/*
  Warnings:

  - A unique constraint covering the columns `[dimensions_id]` on the table `Option` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dimensions_id]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dimensions_id` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Image` ADD COLUMN `option_id` INTEGER NULL,
    MODIFY `product_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Option` ADD COLUMN `dimensions_id` INTEGER NULL,
    ADD COLUMN `price` DOUBLE NULL,
    ADD COLUMN `sku` VARCHAR(191) NULL,
    ADD COLUMN `stock` INTEGER NULL;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `dimensions_id` INTEGER NOT NULL,
    ADD COLUMN `sku` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Dimensions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `weight` DOUBLE NOT NULL,
    `height` DOUBLE NOT NULL,
    `lenght` DOUBLE NOT NULL,
    `width` DOUBLE NOT NULL,
    `product_id` INTEGER NULL,
    `option_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Option_dimensions_id_key` ON `Option`(`dimensions_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Product_sku_key` ON `Product`(`sku`);

-- CreateIndex
CREATE UNIQUE INDEX `Product_dimensions_id_key` ON `Product`(`dimensions_id`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_dimensions_id_fkey` FOREIGN KEY (`dimensions_id`) REFERENCES `Dimensions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `Option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Option` ADD CONSTRAINT `Option_dimensions_id_fkey` FOREIGN KEY (`dimensions_id`) REFERENCES `Dimensions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
