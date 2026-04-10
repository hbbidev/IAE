"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function verifyTeacher(courseId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return null
  const role = (session.user as any).role
  const userId = (session.user as any).id
  if (role === 'ADMIN') return session
  if (role !== 'TEACHER') return null
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.teacherId !== userId) return null
  return session
}

// =================== QUIZ CRUD (TEACHER) ===================

export async function createQuiz(courseId: string, title: string, description: string, timeLimit: number | null, deadline: string | null = null) {
  const session = await verifyTeacher(courseId)
  if (!session) return { error: 'Akses Ditolak' }
  try {
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || null,
        timeLimit,
        deadline: deadline ? new Date(deadline) : null,
        courseId
      }
    })
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true, quizId: quiz.id }
  } catch (e: any) { return { error: e.message } }
}

export async function updateQuiz(quizId: string, courseId: string, title: string, description: string, timeLimit: number | null, isPublished: boolean) {
  const session = await verifyTeacher(courseId)
  if (!session) return { error: 'Akses Ditolak' }
  try {
    await prisma.quiz.update({
      where: { id: quizId },
      data: { title, description: description || null, timeLimit, isPublished }
    })
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

export async function deleteQuiz(quizId: string, courseId: string) {
  const session = await verifyTeacher(courseId)
  if (!session) return { error: 'Akses Ditolak' }
  try {
    await prisma.quiz.delete({ where: { id: quizId } })
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

// =================== QUESTION CRUD (TEACHER) ===================

export async function addQuestion(data: {
  quizId: string
  courseId: string
  text: string
  type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER'
  options?: string[]
  correctAnswer?: string
  points: number
}) {
  const session = await verifyTeacher(data.courseId)
  if (!session) return { error: 'Akses Ditolak' }
  try {
    const count = await prisma.question.count({ where: { quizId: data.quizId } })
    await prisma.question.create({
      data: {
        text: data.text,
        type: data.type,
        options: data.options ? data.options : undefined,
        correctAnswer: data.correctAnswer || null,
        points: data.points,
        order: count,
        quizId: data.quizId,
      }
    })
    revalidatePath(`/teacher/courses/${data.courseId}`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

export async function deleteQuestion(questionId: string, courseId: string) {
  const session = await verifyTeacher(courseId)
  if (!session) return { error: 'Akses Ditolak' }
  try {
    await prisma.question.delete({ where: { id: questionId } })
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

export async function gradeEssayAnswer(answerId: string, score: number, feedback: string, courseId: string) {
  const session = await verifyTeacher(courseId)
  if (!session) return { error: 'Akses Ditolak' }
  try {
    await prisma.quizAnswer.update({
      where: { id: answerId },
      data: { score, feedback: feedback || null, isCorrect: score > 0 }
    })
    // Update total score for the attempt
    const answer = await prisma.quizAnswer.findUnique({
      where: { id: answerId },
      include: { attempt: { include: { answers: true } } }
    })
    if (answer) {
      const totalScore = answer.attempt.answers.reduce((sum, a) => sum + (a.score ?? 0), 0)
      await prisma.quizAttempt.update({
        where: { id: answer.attemptId },
        data: { score: totalScore }
      })
    }
    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

// =================== QUIZ ATTEMPT (STUDENT) ===================

export async function startQuiz(quizId: string) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Tidak terautentikasi' }
  const userId = (session.user as any).id
  try {
    const existing = await prisma.quizAttempt.findUnique({
      where: { quizId_userId: { quizId, userId } }
    })
    if (existing) return { success: true, attemptId: existing.id, alreadyStarted: true }

    const attempt = await prisma.quizAttempt.create({
      data: { quizId, userId }
    })
    return { success: true, attemptId: attempt.id }
  } catch (e: any) { return { error: e.message } }
}

export async function submitQuiz(attemptId: string, answers: { questionId: string; answer: string }[]) {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Tidak terautentikasi' }
  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { quiz: { include: { questions: true } } }
    })
    if (!attempt) return { error: 'Attempt tidak ditemukan' }
    if (attempt.submittedAt) return { error: 'Quiz sudah dikumpulkan' }

    let autoScore = 0

    // Save each answer
    for (const ans of answers) {
      const question = attempt.quiz.questions.find(q => q.id === ans.questionId)
      if (!question) continue

      let isCorrect: boolean | null = null
      let score: number | null = null

      if (question.type === 'MULTIPLE_CHOICE') {
        isCorrect = ans.answer === question.correctAnswer
        score = isCorrect ? question.points : 0
        autoScore += score
      } else if (question.type === 'SHORT_ANSWER' && question.correctAnswer) {
        isCorrect = ans.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
        score = isCorrect ? question.points : 0
        autoScore += score
      }
      // ESSAY: score = null, graded manually by teacher

      await prisma.quizAnswer.upsert({
        where: { attemptId_questionId: { attemptId, questionId: ans.questionId } },
        update: { answer: ans.answer, isCorrect, score },
        create: { attemptId, questionId: ans.questionId, answer: ans.answer, isCorrect, score }
      })
    }

    // Mark as submitted
    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { submittedAt: new Date(), score: autoScore }
    })

    return { success: true, score: autoScore }
  } catch (e: any) { return { error: e.message } }
}
