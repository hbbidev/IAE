-- AlterTable
ALTER TABLE `assignment` ADD COLUMN `weekModuleId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `quiz` ADD COLUMN `weekModuleId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Quiz` ADD CONSTRAINT `Quiz_weekModuleId_fkey` FOREIGN KEY (`weekModuleId`) REFERENCES `WeekModule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_weekModuleId_fkey` FOREIGN KEY (`weekModuleId`) REFERENCES `WeekModule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
