import { PrismaClient, Role, QuestionType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface CourseSeed {
  title: string;
  description: string;
  teacherEmail: string;
  lessons: { title: string; content: string; videoUrl?: string; order: number }[];
  assignments: { title: string; description: string; maxScore: number }[];
  quiz: {
    title: string;
    description: string;
    timeLimit: number;
    questions: { text: string; options: string[]; correctAnswer: string; points: number }[];
  };
}

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10)

  // 1. Seed Users
  console.log('Seeding users...')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.local' },
    update: {},
    create: { email: 'admin@lms.local', name: 'Administrator', nim: 'admin', password: hashedPassword, role: Role.ADMIN },
  })

  const teacher1 = await prisma.user.upsert({
    where: { email: 'guru@lms.local' },
    update: {},
    create: { email: 'guru@lms.local', name: 'Bapak Guru (Eksakta & IT)', nim: 'guru01', password: hashedPassword, role: Role.TEACHER },
  })

  const teacher2 = await prisma.user.upsert({
    where: { email: 'ibubudi@lms.local' },
    update: {},
    create: { email: 'ibubudi@lms.local', name: 'Ibu Budi (Sains & Sosial)', nim: 'guru02', password: hashedPassword, role: Role.TEACHER },
  })

  const teacher3 = await prisma.user.upsert({
    where: { email: 'bapakandi@lms.local' },
    update: {},
    create: { email: 'bapakandi@lms.local', name: 'Bapak Andi (Bahasa & Seni)', nim: 'guru03', password: hashedPassword, role: Role.TEACHER },
  })

  const student1 = await prisma.user.upsert({
    where: { email: 'murid@lms.local' },
    update: {},
    create: { email: 'murid@lms.local', name: 'Siswa Rajin', nim: '10123001', password: hashedPassword, role: Role.STUDENT },
  })

  const student2 = await prisma.user.upsert({
    where: { email: 'budi@lms.local' },
    update: {},
    create: { email: 'budi@lms.local', name: 'Budi Santoso', nim: '10123002', password: hashedPassword, role: Role.STUDENT },
  })

  const student3 = await prisma.user.upsert({
    where: { email: 'ani@lms.local' },
    update: {},
    create: { email: 'ani@lms.local', name: 'Ani Wijaya', nim: '10123003', password: hashedPassword, role: Role.STUDENT },
  })

  const student4 = await prisma.user.upsert({
    where: { email: 'siti@lms.local' },
    update: {},
    create: { email: 'siti@lms.local', name: 'Siti Rahma', nim: '10123004', password: hashedPassword, role: Role.STUDENT },
  })

  const student5 = await prisma.user.upsert({
    where: { email: 'ahmad@lms.local' },
    update: {},
    create: { email: 'ahmad@lms.local', name: 'Ahmad Fauzi', nim: '10123005', password: hashedPassword, role: Role.STUDENT },
  })

  const allTeachers = new Map<string, string>([
    ['guru@lms.local', teacher1.id],
    ['ibubudi@lms.local', teacher2.id],
    ['bapakandi@lms.local', teacher3.id],
  ])

  // Clean up database tables
  console.log('Cleaning up existing database records...')
  await prisma.schedule.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.quizAnswer.deleteMany()
  await prisma.question.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.course.deleteMany()

  // 12 Courses definition with lessons, assignments, quizzes and questions
  const coursesToSeed: CourseSeed[] = [
    {
      title: 'Matematika Dasar',
      description: 'Aljabar linear, kalkulus diferensial dan integral, geometri analitik.',
      teacherEmail: 'guru@lms.local',
      lessons: [
        { title: '1. Pengenalan Aljabar Linear', content: 'Pembahasan matriks, determinan, invers, dan solusi Sistem Persamaan Linear (SPL).', videoUrl: 'https://www.youtube.com/watch?v=fNk_zzaMoEs', order: 1 },
        { title: '2. Kalkulus Diferensial', content: 'Konsep limit fungsi, turunan fungsi aljabar, dan aturan rantai turunan.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Operasi SPL & Invers Matriks', description: 'Kerjakan 5 soal pembuktian invers matriks ordo 3x3 di modul.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: Logika Matematika',
        description: 'Kuis singkat mengenai implikasi, biimplikasi, silogisme, dan tabel kebenaran.',
        timeLimit: 15,
        questions: [
          { text: 'Jika p benar dan q salah, nilai kebenaran dari kontradiksi p -> q adalah...', options: ['Benar', 'Salah', 'Ragu-ragu', 'Semua salah'], correctAnswer: '1', points: 50 },
          { text: 'Pernyataan "Jika hari ini hujan, maka jalanan basah" ekuivalen dengan...', options: ['Hari ini tidak hujan atau jalanan basah', 'Hari ini hujan dan jalanan basah', 'Jika jalanan basah maka hari ini hujan', 'Semua benar'], correctAnswer: '0', points: 50 }
        ]
      }
    },
    {
      title: 'Fisika Modern',
      description: 'Membahas teori kuantum, relativitas Einstein, efek fotolistrik.',
      teacherEmail: 'guru@lms.local',
      lessons: [
        { title: '1. Teori Relativitas Khusus', content: 'Postulat Einstein, dilatasi waktu, kontraksi panjang, dan kesetaraan E=mc².', videoUrl: 'https://www.youtube.com/watch?v=Ev37M5M1-38', order: 1 },
        { title: '2. Efek Fotolistrik & Compton', content: 'Eksperimen efek fotolistrik, fungsi kerja logam, dan panjang gelombang de Broglie.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Dilatasi Waktu Pesawat Antariksa', description: 'Hitung waktu perjalanan astronot pada kecepatan v = 0.8c relatif terhadap bumi.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: Postulat Relativitas',
        description: 'Evaluasi pemahaman dasar postulat Einstein tentang kecepatan cahaya.',
        timeLimit: 10,
        questions: [
          { text: 'Kecepatan cahaya di ruang hampa adalah...', options: ['Berbeda tergantung pengamat', 'Sama untuk semua pengamat', 'Nol di ruang hampa', 'Semua salah'], correctAnswer: '1', points: 100 }
        ]
      }
    },
    {
      title: 'Algoritma & Pemrograman',
      description: 'Dasar logika pemrograman, variabel, loop, array, dan algoritma sorting menggunakan Python.',
      teacherEmail: 'guru@lms.local',
      lessons: [
        { title: '1. Pengenalan Sintaks Python', content: 'Dasar variabel, tipe data dasar (int, float, string), dan input-output.', videoUrl: 'https://www.youtube.com/watch?v=fNk_zzaMoEs', order: 1 },
        { title: '2. Struktur Kontrol Percabangan', content: 'Pernyataan kondisional menggunakan if, elif, dan else di Python.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Implementasi Program Kalkulator Sederhana', description: 'Buat program Python kalkulator yang menerima dua input angka dan satu operator matematika.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: Tipe Data Python',
        description: 'Tes pengetahuan dasar variabel dan tipe data Python.',
        timeLimit: 10,
        questions: [
          { text: 'Manakah penamaan variabel Python yang valid berikut ini?', options: ['1st_variable', 'my-variable', '_my_var_99', 'class'], correctAnswer: '2', points: 100 }
        ]
      }
    },
    {
      title: 'Arsitektur Komputer',
      description: 'Organisasi CPU, memori, cache, ALU, register, set instruksi, dan perakitan mikroprosesor.',
      teacherEmail: 'guru@lms.local',
      lessons: [
        { title: '1. Organisasi CPU & Register', content: 'Cara kerja ALU, Control Unit, Program Counter, dan Instruction Register.', order: 1 },
        { title: '2. Mekanisme Cache Memory', content: 'Prinsip kerja L1, L2, L3 Cache, hit-ratio, dan miss-penalty.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Perancangan Jalur Data ALU', description: 'Gambarkan diagram blok jalur data sederhana untuk operasi penjumlahan 8-bit.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: Siklus Instruksi',
        description: 'Kuis seputar siklus fetch, decode, execute, dan writeback.',
        timeLimit: 15,
        questions: [
          { text: 'Register yang menyimpan alamat instruksi berikutnya adalah...', options: ['Instruction Register', 'Program Counter', 'Accumulator', 'Memory Data Register'], correctAnswer: '1', points: 100 }
        ]
      }
    },
    {
      title: 'Kimia Organik',
      description: 'Senyawa hidrokarbon, benzena, struktur polimer, esterifikasi.',
      teacherEmail: 'ibubudi@lms.local',
      lessons: [
        { title: '1. Hidrokarbon Alifatik', content: 'Karakteristik rantai alkana, alkena, alkuna serta tata namanya.', order: 1 },
        { title: '2. Gugus Fungsi Senyawa Karbon', content: 'Membahas sifat alkohol, eter, keton, aldehid, dan asam karboksilat.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Reaksi Esterifikasi Asam Asetat', description: 'Tuliskan persamaan reaksi pembentukan etil asetat dari asam asetat dan etanol.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: Tata Nama Alkil Halida',
        description: 'Pemberian nama IUPAC senyawa alkil halida.',
        timeLimit: 10,
        questions: [
          { text: 'Senyawa CH3-CH2-Cl memiliki nama IUPAC...', options: ['Klorometana', 'Kloroetana', 'Kloropropana', 'Klorobutana'], correctAnswer: '1', points: 100 }
        ]
      }
    },
    {
      title: 'Biologi Sel',
      description: 'Organel sel hewan dan tumbuhan, siklus sel mitosis meiosis, pembelahan DNA.',
      teacherEmail: 'ibubudi@lms.local',
      lessons: [
        { title: '1. Struktur Sel & Organel', content: 'Pembahasan lisosom, ribosom, mitokondria, kloroplas, dan dinding sel.', order: 1 },
        { title: '2. Respirasi Seluler & ATP', content: 'Tahapan glikolisis, siklus krebs, dan transfer elektron menghasilkan ATP.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Tahapan Pembelahan Mitosis', description: 'Buat rangkuman singkat tentang ciri-ciri metafase dan anafase pada mitosis.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: Struktur Membran Sel',
        description: 'Uji pemahaman model mozaik cair fosfolipid bilayer.',
        timeLimit: 10,
        questions: [
          { text: 'Bagian fosfolipid yang bersifat hidrofobik terletak di...', options: ['Kepala bagian luar', 'Ekor bagian dalam', 'Protein integral', 'Glikoprotein'], correctAnswer: '1', points: 100 }
        ]
      }
    },
    {
      title: 'Ekonomi Makro',
      description: 'Inflasi, deflasi, kebijakan fiskal moneter, pendapatan nasional, dan kurs valuta asing.',
      teacherEmail: 'ibubudi@lms.local',
      lessons: [
        { title: '1. Pendapatan Nasional', content: 'Penghitungan GDP, GNP, NNP, NNI, dan Pendapatan Disposibel.', order: 1 },
        { title: '2. Inflasi & Kebijakan Moneter', content: 'Penyebab inflasi dan peran bank sentral dalam mengontrol jumlah uang beredar.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Analisis Inflasi Pasca Pandemi', description: 'Gambarkan dampak kenaikan suku bunga bank sentral terhadap tingkat investasi makro.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: Perhitungan PDB',
        description: 'Kuis metode pendapatan, pengeluaran, dan produksi.',
        timeLimit: 15,
        questions: [
          { text: 'Manakah rumus PDB pendekatan pengeluaran?', options: ['Y = C + I + G + (X - M)', 'Y = r + w + i + p', 'Y = P1.Q1 + P2.Q2', 'Y = C + S'], correctAnswer: '0', points: 100 }
        ]
      }
    },
    {
      title: 'Sosiologi Budaya',
      description: 'Struktur sosial, dinamika budaya lokal, asimilasi, dan modernisasi masyarakat perkotaan.',
      teacherEmail: 'ibubudi@lms.local',
      lessons: [
        { title: '1. Teori Nilai & Norma Sosial', content: 'Pengertian nilai, macam-macam norma (usage, folkways, mores, customs), dan fungsinya.', order: 1 },
        { title: '2. Asimilasi & Akulturasi Budaya', content: 'Perbedaan percampuran budaya yang melebur menjadi satu vs mempertahankan ciri asli.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Studi Kasus Modernisasi Pedesaan', description: 'Analisis dampak masuknya jaringan internet terhadap interaksi sosial di pedesaan.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: Konsep Multikulturalisme',
        description: 'Pemahaman tentang pluralitas masyarakat.',
        timeLimit: 10,
        questions: [
          { text: 'Sikap menghargai perbedaan budaya kelompok lain disebut...', options: ['Etnosentrisme', 'Pluralisme', 'Rasisme', 'Xenofobia'], correctAnswer: '1', points: 100 }
        ]
      }
    },
    {
      title: 'Bahasa Inggris Akademik',
      description: 'Persiapan TOEFL/IELTS, academic writing, esai argumentatif, dan seminar presentasi.',
      teacherEmail: 'bapakandi@lms.local',
      lessons: [
        { title: '1. Writing Academic Paragraphs', content: 'How to write topic sentences, supporting sentences, and concluding sentences properly.', order: 1 },
        { title: '2. Critical Reading & Text Analysis', content: 'Identifying biases, claims, and main arguments in academic articles.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Menulis Esai Argumentatif', description: 'Write a 300-word argumentative essay on the pros and cons of AI in education.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: English Grammar',
        description: 'Subject-Verb agreement and passive voice structures.',
        timeLimit: 10,
        questions: [
          { text: '"Neither of the students ___ completed the assignment." Select the correct verb:', options: ['have', 'has', 'having', 'are'], correctAnswer: '1', points: 100 }
        ]
      }
    },
    {
      title: 'Sejarah Indonesia',
      description: 'Kolonialisme, perjuangan kemerdekaan, proklamasi, orde lama, orde baru, reformasi.',
      teacherEmail: 'bapakandi@lms.local',
      lessons: [
        { title: '1. Masa Penjajahan Belanda & VOC', content: 'Masuknya Belanda, pembentukan VOC, politik devide et impera, monopoli perdagangan.', order: 1 },
        { title: '2. Perang Diponegoro & Perlawanan Rakyat', content: 'Faktor pemicu Perang Jawa, strategi perang gerilya, dan penangkapan Diponegoro.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Dampak Tanam Paksa (Cultuurstelsel)', description: 'Tulis esai singkat dampak positif dan negatif tanam paksa bagi rakyat pribumi.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: Kolonialisme & Imperialisme',
        description: 'Kuis singkat kedatangan bangsa barat ke nusantara.',
        timeLimit: 10,
        questions: [
          { text: 'Gubernur Jenderal Belanda yang menerapkan Tanam Paksa adalah...', options: ['Daendels', 'Van den Bosch', 'Raffles', 'Jan Pieterszoon Coen'], correctAnswer: '1', points: 100 }
        ]
      }
    },
    {
      title: 'Bahasa Indonesia Jurnalistik',
      description: 'Teknik menulis berita, kode etik jurnalistik, wawancara mendalam, dan penerbitan artikel.',
      teacherEmail: 'bapakandi@lms.local',
      lessons: [
        { title: '1. Penulisan Berita Straight News', content: 'Formula 5W+1H dan struktur piramida terbalik dalam penulisan teras berita.', order: 1 },
        { title: '2. Teknik Wawancara Jurnalistik', content: 'Mempersiapkan janji temu, daftar pertanyaan terbuka, dan merekam suara narasumber.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Membuat Teks Berita Peristiwa', description: 'Susunlah straight news berita berukuran 200 kata mengenai kejadian aktual di sekitar Anda.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: Bahasa Jurnalistik',
        description: 'Memahami diksi dan gaya bahasa jurnalistik.',
        timeLimit: 10,
        questions: [
          { text: 'Bahasa jurnalistik harus memiliki sifat berikut, kecuali...', options: ['Singkat', 'Padat', 'Sederhana', 'Hiperbolis'], correctAnswer: '3', points: 100 }
        ]
      }
    },
    {
      title: 'Seni Rupa & Musik',
      description: 'Teori estetika, teknik lukis kanvas, notasi balok musik klasik, dan sejarah orkestra.',
      teacherEmail: 'bapakandi@lms.local',
      lessons: [
        { title: '1. Pengantar Estetika Seni Rupa', content: 'Mempelajari garis, bidang, warna, tekstur, ruang, gelap terang, serta keselarasan seni.', order: 1 },
        { title: '2. Notasi Balok & Teori Musik Dasar', content: 'Mengenal garis paranada, kunci G, kunci F, ketukan birama, dan nilai not balok.', order: 2 }
      ],
      assignments: [
        { title: 'Tugas 1: Analisis Komposisi Karya Lukis', description: 'Pilihlah satu lukisan Raden Saleh, kemudian tulis analisis prinsip kesatuan di dalamnya.', maxScore: 100 }
      ],
      quiz: {
        title: 'Kuis 1: Sejarah Musik Klasik',
        description: 'Mengenal zaman Barok, Klasik, dan Romantik.',
        timeLimit: 10,
        questions: [
          { text: 'Komposer ternama yang menggubah Symphony No. 5 (tak-tak-tak-taum) adalah...', options: ['Mozart', 'Beethoven', 'Bach', 'Chopin'], correctAnswer: '1', points: 100 }
        ]
      }
    }
  ]

  // Seed courses and everything inside them
  console.log('Seeding courses, lessons, assignments, quizzes, and questions...')
  const createdCourses = new Map<string, string>()

  for (const cData of coursesToSeed) {
    const teacherId = allTeachers.get(cData.teacherEmail)
    if (!teacherId) continue

    const course = await prisma.course.create({
      data: {
        title: cData.title,
        description: cData.description,
        teacherId: teacherId,
      }
    })
    createdCourses.set(cData.title, course.id)

    // Lessons
    for (const l of cData.lessons) {
      await prisma.lesson.create({
        data: {
          title: l.title,
          content: l.content,
          videoUrl: l.videoUrl,
          order: l.order,
          courseId: course.id,
        }
      })
    }

    // Assignments
    const now = new Date()
    for (const a of cData.assignments) {
      const due = new Date(); due.setDate(now.getDate() + 4)
      await prisma.assignment.create({
        data: {
          title: a.title,
          description: a.description,
          dueDate: due,
          maxScore: a.maxScore,
          courseId: course.id,
        }
      })
    }

    // Quiz & Questions
    const dueQuiz = new Date(); dueQuiz.setDate(now.getDate() + 5)
    const quiz = await prisma.quiz.create({
      data: {
        title: cData.quiz.title,
        description: cData.quiz.description,
        timeLimit: cData.quiz.timeLimit,
        deadline: dueQuiz,
        isPublished: true,
        courseId: course.id,
      }
    })

    for (let i = 0; i < cData.quiz.questions.length; i++) {
      const q = cData.quiz.questions[i]
      await prisma.question.create({
        data: {
          text: q.text,
          type: QuestionType.MULTIPLE_CHOICE,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          order: i + 1,
          quizId: quiz.id,
        }
      })
    }
  }

  // 6. Enrollments (Enroll students to courses)
  console.log('Seeding enrollments...')
  const allStudents = [student1, student2, student3, student4, student5]

  // Siswa Rajin (student1) enrolled in ALL 12 courses to see everything!
  for (const courseTitle of createdCourses.keys()) {
    const courseId = createdCourses.get(courseTitle)!
    await prisma.enrollment.create({
      data: {
        userId: student1.id,
        courseId: courseId,
        progress: Math.floor(Math.random() * 80) + 10,
      }
    })
  }

  // Other students enrolled randomly in 6-8 courses
  const otherStudents = [student2, student3, student4, student5]
  for (const std of otherStudents) {
    const shuffledTitles = Array.from(createdCourses.keys()).sort(() => 0.5 - Math.random())
    const selectedTitles = shuffledTitles.slice(0, 7)
    for (const title of selectedTitles) {
      const courseId = createdCourses.get(title)!
      await prisma.enrollment.create({
        data: {
          userId: std.id,
          courseId: courseId,
          progress: Math.floor(Math.random() * 60) + 5,
        }
      })
    }
  }

  // 7. Schedules (Full school timetable Monday to Sunday)
  console.log('Seeding daily schedules...')
  const c1_id = createdCourses.get('Matematika Dasar')!
  const c2_id = createdCourses.get('Fisika Modern')!
  const c3_id = createdCourses.get('Algoritma & Pemrograman')!
  const c4_id = createdCourses.get('Arsitektur Komputer')!
  const c5_id = createdCourses.get('Kimia Organik')!
  const c6_id = createdCourses.get('Biologi Sel')!
  const c7_id = createdCourses.get('Ekonomi Makro')!
  const c8_id = createdCourses.get('Sosiologi Budaya')!
  const c9_id = createdCourses.get('Bahasa Inggris Akademik')!
  const c10_id = createdCourses.get('Sejarah Indonesia')!
  const c11_id = createdCourses.get('Bahasa Indonesia Jurnalistik')!
  const c12_id = createdCourses.get('Seni Rupa & Musik')!
  
  // Monday (1)
  await prisma.schedule.create({ data: { dayOfWeek: 1, startTime: '08:00', endTime: '10:00', room: 'R. 101 - Lantai 1', courseId: c1_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 1, startTime: '10:15', endTime: '12:15', room: 'Lab Kimia - Lantai 2', courseId: c5_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 1, startTime: '13:00', endTime: '15:00', room: 'Lab Komputer A', courseId: c3_id } })

  // Tuesday (2)
  await prisma.schedule.create({ data: { dayOfWeek: 2, startTime: '08:00', endTime: '10:00', room: 'Lab Biologi - Lantai 1', courseId: c6_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 2, startTime: '10:15', endTime: '12:15', room: 'R. 201 - Lantai 2', courseId: c7_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 2, startTime: '13:00', endTime: '15:00', room: 'R. 204 - Lantai 2', courseId: c10_id } })

  // Wednesday (3)
  await prisma.schedule.create({ data: { dayOfWeek: 3, startTime: '08:00', endTime: '10:00', room: 'R. 102 - Lantai 1', courseId: c2_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 3, startTime: '10:15', endTime: '12:15', room: 'R. 301 - Lantai 3', courseId: c9_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 3, startTime: '13:00', endTime: '15:00', room: 'Lab Komputer B', courseId: c4_id } })

  // Thursday (4)
  await prisma.schedule.create({ data: { dayOfWeek: 4, startTime: '08:00', endTime: '10:00', room: 'R. 101 - Lantai 1', courseId: c1_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 4, startTime: '10:15', endTime: '12:15', room: 'Lab Komputer A', courseId: c3_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 4, startTime: '13:00', endTime: '15:00', room: 'Lab Kimia - Lantai 2', courseId: c5_id } })

  // Friday (5)
  await prisma.schedule.create({ data: { dayOfWeek: 5, startTime: '08:00', endTime: '10:00', room: 'Lab Biologi - Lantai 1', courseId: c6_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 5, startTime: '10:15', endTime: '12:15', room: 'R. 301 - Lantai 3', courseId: c9_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 5, startTime: '13:00', endTime: '15:00', room: 'R. 305 - Lantai 3', courseId: c11_id } })

  // Saturday (6)
  await prisma.schedule.create({ data: { dayOfWeek: 6, startTime: '09:00', endTime: '11:00', room: 'R. 204 - Lantai 2', courseId: c10_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 6, startTime: '11:15', endTime: '13:15', room: 'Studio Seni - Lantai 1', courseId: c12_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 6, startTime: '14:00', endTime: '16:00', room: 'R. 202 - Lantai 2', courseId: c8_id } })

  // Sunday (7) - TODAY (Seeded with 6 schedules so there are many active classes visible today)
  await prisma.schedule.create({ data: { dayOfWeek: 7, startTime: '08:00', endTime: '09:30', room: 'Virtual Room A', courseId: c1_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 7, startTime: '09:45', endTime: '11:15', room: 'Virtual Room B', courseId: c2_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 7, startTime: '11:30', endTime: '13:00', room: 'Virtual Room C', courseId: c3_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 7, startTime: '13:15', endTime: '14:45', room: 'Virtual Room D', courseId: c5_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 7, startTime: '15:00', endTime: '16:30', room: 'Virtual Room E', courseId: c9_id } })
  await prisma.schedule.create({ data: { dayOfWeek: 7, startTime: '16:45', endTime: '18:15', room: 'Virtual Room F', courseId: c7_id } })

  // 11. Seeding demo submissions for grading features
  console.log('Seeding student submissions...')
  
  // Find assignment IDs by checking course details
  const a1_db = await prisma.assignment.findFirst({ where: { courseId: c1_id, title: { startsWith: 'Tugas 1' } } })
  const a3_db = await prisma.assignment.findFirst({ where: { courseId: c2_id, title: { startsWith: 'Tugas 1' } } })
  const a4_db = await prisma.assignment.findFirst({ where: { courseId: c3_id, title: { startsWith: 'Tugas 1' } } })

  if (a1_db && a3_db && a4_db) {
    // student2 Budi submissions
    await prisma.submission.create({
      data: {
        content: 'Budi Santoso - Jawaban Tugas 1 Matematika Dasar:\n1. Persamaan linear dapat dipecahkan dengan OBE matriks.\nDeterminan matriks A adalah 5, Adjoint A didapatkan, sehingga A^-1 = 1/5 * Adjoint(A).\n3. Solusi SPL x=2, y=-1, z=3.',
        score: null, // Pending grading
        assignmentId: a1_db.id,
        userId: student2.id,
      }
    })

    await prisma.submission.create({
      data: {
        content: 'Budi Santoso - Jawaban Tugas Dilatasi Waktu:\nFaktor Lorentz gamma = 1 / sqrt(1 - v^2/c^2)\nUntuk v = 0.8c -> gamma = 1 / sqrt(1 - 0.64) = 1 / 0.6 = 1.67\nWaktu pengamat bumi t = gamma * t0\nJika astronot mengukur 1 tahun, maka pengamat bumi mengukur 1.67 tahun.',
        score: null, // Pending grading
        assignmentId: a3_db.id,
        userId: student2.id,
      }
    })

    // student3 Ani submissions (graded)
    await prisma.submission.create({
      data: {
        content: 'Ani Wijaya - Tugas 1:\nDeterminan didapatkan 5. Matriks kofaktor yang didapat:\nC11 = 3, C12 = -2, C13 = 1...\nAdjoint A adalah transpose kofaktor.\nHasil A^-1:\n[0.6  -0.2  0.2]\n[-0.4  0.8 -0.2]\n[0.2  -0.4  0.4]',
        score: 85, // Already graded
        feedback: 'Kerjaan sangat bagus dan sistematis, pertahankan Ani!',
        assignmentId: a1_db.id,
        userId: student3.id,
      }
    })

    // student4 Siti submissions (pending)
    await prisma.submission.create({
      data: {
        content: 'Siti Rahma - Tugas 1:\nJawaban dilampirkan via salinan teks:\nInvers A = [[3/5, -1/5, 1/5], [-2/5, 4/5, -1/5], [1/5, -2/5, 2/5]].\nTerima kasih Pak Guru.',
        score: null, // Pending grading
        assignmentId: a1_db.id,
        userId: student4.id,
      }
    })

    // student5 Ahmad submissions (pending)
    await prisma.submission.create({
      data: {
        content: 'Ahmad Fauzi - Tugas 1 Kalkulator Python:\n\nnum1 = float(input("Angka 1: "))\noperator = input("Operator (+,-,*,/): ")\nnum2 = float(input("Angka 2: "))\n\nif operator == "+":\n    print(num1 + num2)\nelif operator == "-":\n    print(num1 - num2)\nelif operator == "*":\n    print(num1 * num2)\nelif operator == "/":\n    print(num1 / num2)\nelse:\n    print("Operator tidak valid")',
        score: null, // Pending grading
        assignmentId: a4_db.id,
        userId: student5.id,
      }
    })
  }

  console.log('Prisma Seeding Completed Successfully! All 12 courses now have customized materials, schedules, assignments, and quizzes.', {
    admin: admin.email,
    teachersCount: 3,
    studentsCount: allStudents.length,
    coursesCount: createdCourses.size,
    schedulesCount: 21,
    demoSubmissionsCount: 5
  })
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
