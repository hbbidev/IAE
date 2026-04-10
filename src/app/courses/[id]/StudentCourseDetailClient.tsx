"use client";

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, BookOpen, ClipboardList, PlayCircle, FileText,
    ChevronDown, ChevronUp, CheckCircle2, Clock, AlertCircle,
    Star, Loader2, Send, CheckSquare
} from 'lucide-react';
import { submitAssignment } from '@/actions/assignment';
import QuizRunner from './QuizRunner';

type Tab = 'materi' | 'tugas' | 'quiz';

export default function StudentCourseDetailClient({ course }: { course: any }) {
    const [activeTab, setActiveTab] = useState<Tab>('materi');

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back + Header */}
            <div className="mb-6">
                <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors font-medium">
                    <ArrowLeft size={16} /> Kembali ke Katalog Kursus
                </Link>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                        <PlayCircle size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{course.title}</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Diajarkan oleh <strong className="text-slate-700 dark:text-slate-300">{course.teacher?.name}</strong></p>
                    </div>
                </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-1.5">
                    <BookOpen size={14} /> {course.lessons.length} Materi
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-medium flex items-center gap-1.5">
                    <ClipboardList size={14} /> {course.assignments.length} Tugas
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> {course.assignments.filter((a: any) => a.mySubmission).length} Dikumpulkan
                </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-6 w-fit">
                {(['materi', 'tugas', 'quiz'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200
                            ${activeTab === tab
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        {tab === 'materi' ? <BookOpen size={15} /> : tab === 'tugas' ? <ClipboardList size={15} /> : <CheckSquare size={15} />}
                        {tab === 'materi' ? 'Materi Pelajaran' : tab === 'tugas' ? 'Tugas & Pengumpulan' : 'Quiz'}
                        {tab === 'quiz' && course.quizzes?.length > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>{course.quizzes.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'materi' && <MateriTab lessons={course.lessons} />}
            {activeTab === 'tugas' && <TugasTab assignments={course.assignments} />}
            {activeTab === 'quiz' && <QuizListTab quizzes={course.quizzes ?? []} />}
        </div>
    );
}

function MateriTab({ lessons }: { lessons: any[] }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (lessons.length === 0) return (
        <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center text-slate-400">
            <FileText size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Belum ada materi yang dipublikasikan guru.</p>
        </div>
    );

    return (
        <div className="space-y-3">
            {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
                    <button
                        className="w-full flex items-center justify-between p-4 text-left"
                        onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                            </span>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{lesson.title}</p>
                                {lesson.videoUrl && (
                                    <span className="text-xs bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-md font-medium">▶ Video</span>
                                )}
                            </div>
                        </div>
                        {expandedId === lesson.id ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                    </button>

                    {expandedId === lesson.id && (
                        <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700/50 pt-4 space-y-3">
                            {lesson.videoUrl && (
                                <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors">
                                    ▶ Tonton Video Materi
                                </a>
                            )}
                            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{lesson.content}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function TugasTab({ assignments }: { assignments: any[] }) {
    if (assignments.length === 0) return (
        <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center text-slate-400">
            <ClipboardList size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Belum ada tugas dari guru.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {assignments.map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
        </div>
    );
}

function AssignmentCard({ assignment }: { assignment: any }) {
    const [expanded, setExpanded] = useState(false);
    const [answer, setAnswer] = useState(assignment.mySubmission?.content ?? '');
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState('');

    const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
    const submitted = !!assignment.mySubmission;
    const graded = assignment.mySubmission?.score !== null && assignment.mySubmission?.score !== undefined;

    const handleSubmit = () => {
        if (!answer.trim()) return;
        startTransition(async () => {
            setMsg('');
            const res = await submitAssignment(assignment.id, answer);
            if (res.error) setMsg('❌ ' + res.error);
            else setMsg('✓ ' + res.message);
        });
    };

    return (
        <div className={`glass-panel rounded-2xl overflow-hidden ${submitted ? 'ring-2 ring-emerald-500/20' : ''}`}>
            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            {graded ? (
                                <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                                    <Star size={11} /> Dinilai: {assignment.mySubmission.score}/{assignment.maxScore}
                                </span>
                            ) : submitted ? (
                                <span className="flex items-center gap-1 text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full">
                                    <CheckCircle2 size={11} /> Sudah Dikumpulkan
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
                                    <AlertCircle size={11} /> Belum Dikumpulkan
                                </span>
                            )}
                            {assignment.dueDate && (
                                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isOverdue && !submitted ? 'text-red-600 bg-red-50 dark:bg-red-500/10' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}>
                                    <Clock size={11} />
                                    Tenggat: {new Date(assignment.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{assignment.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Nilai Maksimum: {assignment.maxScore}</p>
                    </div>
                    <button onClick={() => setExpanded(!expanded)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 dark:border-slate-700/50 p-5 space-y-4">
                    {/* Soal */}
                    {assignment.description && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Soal / Instruksi</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{assignment.description}</p>
                        </div>
                    )}

                    {/* Feedback jika sudah dinilai */}
                    {graded && assignment.mySubmission?.feedback && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                            <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Feedback Guru</p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400">{assignment.mySubmission.feedback}</p>
                        </div>
                    )}

                    {/* Textarea jawaban */}
                    {!graded && (
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase block">Jawaban Saya</label>
                            <textarea
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                rows={5}
                                placeholder="Tuliskan jawaban Anda di sini..."
                                disabled={isOverdue && !submitted}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {msg && <p className={`text-sm font-medium ${msg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</p>}
                            {!(isOverdue && !submitted) && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!answer.trim() || isPending}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm disabled:opacity-50 transition-colors shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                                >
                                    {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    {submitted ? 'Perbarui Jawaban' : 'Kumpulkan Tugas'}
                                </button>
                            )}
                            {isOverdue && !submitted && (
                                <p className="text-sm text-red-500 font-medium flex items-center gap-1"><AlertCircle size={14} /> Tenggat waktu sudah lewat. Tugas tidak dapat dikumpulkan.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function QuizListTab({ quizzes }: { quizzes: any[] }) {
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);

    if (quizzes.length === 0) return (
        <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center text-slate-400">
            <CheckSquare size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Belum ada quiz yang dipublikasikan guru.</p>
        </div>
    );

    if (selectedQuiz) return (
        <div className="space-y-4">
            <button onClick={() => setSelectedQuizId(null)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">
                ← Kembali ke Daftar Quiz
            </button>
            <QuizRunner quiz={selectedQuiz} previousAttempt={selectedQuiz.myAttempt ?? null} />
        </div>
    );

    return (
        <div className="space-y-3">
            {quizzes.map(quiz => {
                const attempt = quiz.myAttempt;
                const done = !!attempt?.submittedAt;
                const totalPoints = quiz.questions?.reduce((s: number, q: any) => s + q.points, 0) ?? 0;

                // Deadline logic
                const deadline = quiz.deadline ? new Date(quiz.deadline) : null;
                const now = new Date();
                const isExpired = deadline ? deadline < now : false;
                const hoursLeft = deadline ? (deadline.getTime() - now.getTime()) / 3600000 : null;
                const canTake = !isExpired;

                let deadlineBadge = null;
                if (deadline) {
                    if (isExpired) {
                        deadlineBadge = (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 font-medium">
                                <Clock size={11} /> Tutup: {deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        );
                    } else if (hoursLeft !== null && hoursLeft < 24) {
                        deadlineBadge = (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium animate-pulse">
                                <Clock size={11} /> Tutup: {deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} ({Math.ceil(hoursLeft)}j lagi)
                            </span>
                        );
                    } else {
                        deadlineBadge = (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                <Clock size={11} /> Tenggat: {deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        );
                    }
                }

                return (
                    <div key={quiz.id} className={`glass-panel rounded-2xl p-5 flex items-center justify-between gap-4 hover-lift ${done ? 'ring-2 ring-emerald-500/20' : isExpired && !done ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={done ? 'w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 shrink-0' : 'w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 shrink-0'}>
                                {done ? <CheckCircle2 size={24} /> : <CheckSquare size={24} />}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{quiz.title}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-500">{quiz.questions?.length ?? 0} soal &middot; {totalPoints} poin</span>
                                    {quiz.timeLimit && <span className="text-xs text-slate-500">⏱ {quiz.timeLimit} menit</span>}
                                    {done && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Skor: {attempt.score}/{totalPoints}</span>}
                                    {deadlineBadge}
                                </div>
                            </div>
                        </div>
                        {canTake || done ? (
                            <button
                                onClick={() => setSelectedQuizId(quiz.id)}
                                className={done
                                    ? 'px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 transition-all shrink-0'
                                    : 'px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all shrink-0'
                                }
                            >
                                {done ? 'Lihat Hasil' : 'Kerjakan Quiz'}
                            </button>
                        ) : (
                            <span className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-red-50 dark:bg-red-500/10 text-red-500 shrink-0 cursor-not-allowed">
                                Waktu Habis
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
