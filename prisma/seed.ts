import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10)

  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.local' },
    update: {},
    create: {
      email: 'admin@lms.local',
      name: 'Administrator',
      nim: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // 2. Guru
  const guru = await prisma.user.upsert({
    where: { email: 'guru@lms.local' },
    update: {},
    create: {
      email: 'guru@lms.local',
      name: 'Bapak Guru',
      nim: 'guru',
      password: hashedPassword,
      role: 'TEACHER',
    },
  })

  // 3. Murid
  const murid = await prisma.user.upsert({
    where: { email: 'murid@lms.local' },
    update: {},
    create: {
      email: 'murid@lms.local',
      name: 'Siswa Rajin',
      nim: 'murid',
      password: hashedPassword,
      role: 'STUDENT',
    },
  })

  console.log('Seed completed!', { admin, guru, murid })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
