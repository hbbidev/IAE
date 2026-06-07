import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import GradesClient from "./GradesClient";

function getCourseCode(title: string): string {
    const initials = title
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word[0].toUpperCase())
        .join('');
    const base = initials.length >= 3 ? initials.substring(0, 3) : (initials + 'KRS').substring(0, 3);
    return `${base}101`;
}

function getCourseJp(title: string): number {
    const len = title.length;
    if (len % 3 === 0) return 3;
    if (len % 3 === 1) return 4;
    return 2;
}

function getLetterGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'E';
}

export default async function GradesPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (role === 'TEACHER') redirect('/teacher/courses');
    if (role === 'ADMIN') redirect('/admin/courses');

    // Get all enrolled courses, including assignments + student submissions, and quizzes + student attempts
    const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
            course: {
                include: {
                    assignments: {
                        include: {
                            submissions: {
                                where: { userId }
                            }
                        }
                    },
                    quizzes: {
                        where: { isPublished: true },
                        include: {
                            questions: { select: { points: true } },
                            attempts: { where: { userId } }
                        }
                    }
                }
            }
        }
    });

    let totalJp = 0;
    let totalScoreSum = 0;
    let gradedSubjectsCount = 0;

    const gradesList = enrollments.map(e => {
        const course = e.course;
        const jp = getCourseJp(course.title);
        const code = getCourseCode(course.title);
        totalJp += jp;

        const gradedItems: number[] = [];

        // 1. Fetch graded assignments
        for (const assignment of course.assignments) {
            const sub = assignment.submissions[0];
            if (sub && sub.score !== null) {
                const percentage = (sub.score / assignment.maxScore) * 100;
                gradedItems.push(percentage);
            }
        }

        // 2. Fetch graded quizzes
        for (const quiz of course.quizzes) {
            const attempt = quiz.attempts[0];
            if (attempt && attempt.score !== null) {
                const quizMaxPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
                if (quizMaxPoints > 0) {
                    const percentage = (attempt.score / quizMaxPoints) * 100;
                    gradedItems.push(percentage);
                }
            }
        }

        const score = gradedItems.length > 0
            ? Math.round(gradedItems.reduce((acc, val) => acc + val, 0) / gradedItems.length)
            : null;

        let grade = "—";
        let status = "BELUM DINILAI";

        if (score !== null) {
            grade = getLetterGrade(score);
            status = score >= 60 ? "LULUS" : "TIDAK LULUS";
            
            totalScoreSum += score;
            gradedSubjectsCount++;
        }

        return {
            code,
            title: course.title,
            jp,
            score,
            grade,
            status
        };
    });

    const averageScoreVal = gradedSubjectsCount > 0 ? (totalScoreSum / gradedSubjectsCount) : 0;
    const averageScore = averageScoreVal > 0 ? averageScoreVal.toFixed(1) : "0.0";

    let predicate = "—";
    if (averageScoreVal >= 90) {
        predicate = "Sangat Baik";
    } else if (averageScoreVal >= 80) {
        predicate = "Baik";
    } else if (averageScoreVal >= 70) {
        predicate = "Cukup";
    } else if (averageScoreVal > 0) {
        predicate = "Kurang";
    }

    return (
        <GradesClient
            averageScore={averageScore}
            totalJp={totalJp}
            subjectCount={enrollments.length}
            predicate={predicate}
            gradesList={gradesList}
        />
    );
}
