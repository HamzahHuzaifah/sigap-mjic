import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 0. Seed Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Admin SIGAP',
      role: 'ADMIN',
    },
  });
  console.log(`Created admin user: ${admin.username}`);

  // 1. Seed Subjects (Mata Pelajaran)
  const subjectsData = [
    { name: 'Matematika' },
    { name: 'Bahasa Indonesia' },
    { name: 'Bahasa Inggris' },
    { name: 'Ilmu Pengetahuan Alam' },
    { name: 'Pendidikan Agama Islam' },
  ];

  for (const subject of subjectsData) {
    const createdSubject = await prisma.subject.upsert({
      where: { name: subject.name },
      update: {},
      create: subject,
    });
    console.log(`Created subject with id: ${createdSubject.id} - ${createdSubject.name}`);
  }

  // 2. Seed Students (Siswa)
  const studentsData = [
    { nisn: '0011223344', name: 'Ahmad Budi' },
    { nisn: '0022334455', name: 'Siti Aminah' },
    { nisn: '0033445566', name: 'Budi Santoso' },
    { nisn: '0044556677', name: 'Dewi Lestari' },
    { nisn: '0055667788', name: 'Eko Prasetyo' },
  ];

  for (const student of studentsData) {
    const createdStudent = await prisma.student.upsert({
      where: { nisn: student.nisn },
      update: {},
      create: student,
    });
    console.log(`Created student with id: ${createdStudent.id} - ${createdStudent.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
