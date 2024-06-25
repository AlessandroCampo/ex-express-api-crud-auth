/*
  Warnings:

  - You are about to drop the column `isAdmind` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `isAdmind`,
    ADD COLUMN `isAdmin` BOOLEAN NOT NULL DEFAULT false;
