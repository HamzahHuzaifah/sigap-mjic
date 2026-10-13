-- ==============================================================
-- SKEMA & DATA AWAL DATABASE SIGAP MJIC (MySQL / phpMyAdmin)
-- ==============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabel Student
CREATE TABLE IF NOT EXISTS `Student` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nisn` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `Student_nisn_key`(`nisn`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Subject
CREATE TABLE IF NOT EXISTS `Subject` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `Subject_name_key`(`name`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Attendance
CREATE TABLE IF NOT EXISTS `Attendance` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` DATETIME(3) NOT NULL,
  `status` ENUM('HADIR', 'SAKIT', 'IZIN', 'ALFA') NOT NULL,
  `studentId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `Attendance_studentId_date_key`(`studentId`, `date`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel Grade
CREATE TABLE IF NOT EXISTS `Grade` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `score` DOUBLE NOT NULL,
  `type` ENUM('TUGAS', 'UTS', 'UAS') NOT NULL,
  `studentId` INT NOT NULL,
  `subjectId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `Grade_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Grade_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel User
CREATE TABLE IF NOT EXISTS `User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `User_username_key`(`username`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================
-- DATA AWAL (SEED): AKUN ADMIN, MAPEL, DAN SISWA
-- ==============================================================

-- Akun Login Default:
-- Username: admin
-- Password: admin123
INSERT INTO `User` (`username`, `password`, `name`, `role`, `createdAt`, `updatedAt`)
VALUES ('admin', '$2b$10$Iuf/rM43O0khRx5Tztg6BeTdlbsvQkCs5Hbk3cPd9gaWf6j.SMN0m', 'Admin SIGAP', 'ADMIN', NOW(), NOW())
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Mata Pelajaran Default
INSERT INTO `Subject` (`name`, `createdAt`, `updatedAt`) VALUES
('Matematika', NOW(), NOW()),
('Bahasa Indonesia', NOW(), NOW()),
('Bahasa Inggris', NOW(), NOW()),
('Ilmu Pengetahuan Alam', NOW(), NOW()),
('Pendidikan Agama Islam', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Siswa Contoh Default
INSERT INTO `Student` (`nisn`, `name`, `createdAt`, `updatedAt`) VALUES
('0011223344', 'Ahmad Budi', NOW(), NOW()),
('0022334455', 'Siti Aminah', NOW(), NOW()),
('0033445566', 'Budi Santoso', NOW(), NOW()),
('0044556677', 'Dewi Lestari', NOW(), NOW()),
('0055667788', 'Eko Prasetyo', NOW(), NOW())
ON DUPLICATE KEY UPDATE `nisn`=`nisn`;
