-- AlterTable
ALTER TABLE `user` ADD COLUMN `confirmedEmail` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isAdmind` BOOLEAN NOT NULL DEFAULT false;
