"use client";

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, BookOpen, ClipboardList, PlayCircle, FileText,
    ChevronDown, ChevronUp, CheckCircle2, Clock, AlertCircle,
    Star, Loader2, Send, CheckSquare
} from 'lucide-react';
import { submitAssignment } from '@/actions/assignment';
import { retakeQuiz } from '@/actions/quiz';
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
                    <div className="w-12 h-12 rounded-2xl accent-bg flex items-center justify-center text-white shrink-0 shadow-lg">
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
                <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-1.5">
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
            {activeTab === 'materi' && <MateriTab lessons={course.lessons} weekModules={course.weekModules ?? []} />}
            {activeTab === 'tugas' && <TugasTab assignments={course.assignments} weekModules={course.weekModules ?? []} />}
            {activeTab === 'quiz' && <QuizListTab quizzes={course.quizzes ?? []} weekModules={course.weekModules ?? []} />}
        </div>
    );
}

function MateriTab({ lessons, weekModules }: { lessons: any[]; weekModules: any[] }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [openWeeks, setOpenWeeks] = useState<Set<string>>(new Set(['__unassigned__']));

    const toggleWeek = (id: string) => {
        setOpenWeeks(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (lessons.length === 0) return (
        <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center text-slate-400">
            <FileText size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Belum ada materi yang dipublikasikan guru.</p>
        </div>
    );

    const unassigned = lessons.filter(l => !l.weekModuleId);
    const hasWeeks = weekModules.length > 0;

    return (
        <div className="space-y-4">
            {/* Ringkasan progress */}
            <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Progress Materi</p>
                        <p className="text-xs font-semibold accent-text">{lessons.length} materi · {weekModules.length} modul</p>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full accent-bg rounded-full transition-all" style={{ width: '100%' }} />
                    </div>
                </div>
            </div>

            {/* Materi tanpa modul */}
            {unassigned.length > 0 && (
                <div className="space-y-2">
                    {hasWeeks && (
                        <button
                            onClick={() => toggleWeek('__unassigned__')}
                            className="w-full flex items-center gap-3 px-1 py-1 group"
                        >
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">?</div>
                            <p className="text-sm font-bold text-slate-500 flex-1 text-left">Materi Umum</p>
                            <span className="text-xs text-slate-400">{unassigned.length} materi</span>
                            {openWeeks.has('__unassigned__') ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                        </button>
                    )}
                    {(!hasWeeks || openWeeks.has('__unassigned__')) && unassigned.map((lesson, idx) => (
                        <LessonCard key={lesson.id} lesson={lesson} idx={idx} expandedId={expandedId} setExpandedId={setExpandedId} />
                    ))}
                </div>
            )}

            {/* Per modul minggu */}
            {weekModules.map((wm: any, wmIdx: number) => {
                const wLessons = lessons.filter(l => l.weekModuleId === wm.id);
                const isOpen = openWeeks.has(wm.id);
                return (
                    <div key={wm.id} className="space-y-2">
                        {/* Week header */}
                        <button
                            onClick={() => toggleWeek(wm.id)}
                            className="w-full flex items-center gap-3 px-1 py-1 group"
                        >
                            <div className="w-7 h-7 rounded-lg accent-bg text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                                {wm.weekNumber}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:accent-text transition-colors">{wm.title}</p>
                            </div>
                            <span className="text-xs text-slate-400 shrink-0">{wLessons.length} materi</span>
                            {isOpen ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                        </button>

                        {/* Separator line */}
                        <div className="ml-10 h-px bg-slate-100 dark:bg-slate-800" />

                        {/* Lessons */}
                        {isOpen && (
                            wLessons.length === 0 ? (
                                <p className="text-xs text-slate-400 italic ml-10">Belum ada materi di modul ini.</p>
                            ) : (
                                <div className="space-y-2 ml-0">
                                    {wLessons.map((lesson, idx) => (
                                        <LessonCard key={lesson.id} lesson={lesson} idx={idx} expandedId={expandedId} setExpandedId={setExpandedId} />
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function LessonCard({ lesson, idx, expandedId, setExpandedId }: { lesson: any; idx: number; expandedId: string | null; setExpandedId: (id: string | null) => void }) {
    const isExpanded = expandedId === lesson.id;
    return (
        <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
            <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpandedId(isExpanded ? null : lesson.id)}
            >
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl accent-tint accent-text text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                    </span>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{lesson.title}</p>
                        {lesson.videoUrl && (
                            <span className="text-xs bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-md font-medium">▶ Video</span>
                        )}
                    </div>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
            </button>

            {isExpanded && (
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
    );
}


function TugasTab({ assignments, weekModules }: { assignments: any[]; weekModules: any[] }) {
    if (assignments.length === 0) return (
        <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center text-slate-400">
            <ClipboardList size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Belum ada tugas dari guru.</p>
        </div>
    );

    const unassigned = assignments.filter(a => !a.weekModuleId);
    const hasWeeks = weekModules.length > 0;

    // Helper: render week header
    const WeekHeader = ({ wm, count }: { wm: any; count: number }) => (
        <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-lg accent-bg text-white text-xs font-bold flex items-center justify-center shrink-0">{wm.weekNumber}</div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1">{wm.title}</p>
            <span className="text-xs text-slate-400">{count} tugas</span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Tugas tanpa modul */}
            {unassigned.length > 0 && (
                <div className="space-y-3">
                    {hasWeeks && <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Umum</p>}
                    {unassigned.map(assignment => (
                        <AssignmentCard key={assignment.id} assignment={assignment} />
                    ))}
                </div>
            )}

            {/* Per modul minggu */}
            {weekModules.map((wm: any) => {
                const wAssignments = assignments.filter(a => a.weekModuleId === wm.id);
                return (
                    <div key={wm.id} className="space-y-3">
                        <WeekHeader wm={wm} count={wAssignments.length} />
                        <div className="ml-9 h-px bg-slate-100 dark:bg-slate-800" />
                        {wAssignments.length === 0 ? (
                            <p className="text-xs text-slate-400 italic pl-9">Belum ada tugas di modul ini.</p>
                        ) : (
                            wAssignments.map(assignment => (
                                <AssignmentCard key={assignment.id} assignment={assignment} />
                            ))
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function AssignmentCard({ assignment }: { assignment: any }) {
    const [expanded, setExpanded] = useState(false);
    const [answer, setAnswer] = useState(assignment.mySubmission?.content ?? '');
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState(assignment.mySubmission?.fileUrl ?? '');
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState('');

    const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
    const submitted = !!assignment.mySubmission;
    const graded = assignment.mySubmission?.score !== null && assignment.mySubmission?.score !== undefined;
    const submissionType = assignment.submissionType || 'TEXT';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
                setMsg('❌ Hanya file PDF yang diperbolehkan');
                setFile(null);
                return;
            }
            if (selected.size > 10 * 1024 * 1024) {
                setMsg('❌ Ukuran file maksimal adalah 10MB');
                setFile(null);
                return;
            }
            setFile(selected);
            setMsg('');
        }
    };

    const handleSubmit = () => {
        // Validasi
        if (submissionType === 'TEXT' && !answer.trim()) {
            setMsg('❌ Tuliskan jawaban Anda terlebih dahulu');
            return;
        }
        if (submissionType === 'FILE' && !file && !fileUrl) {
            setMsg('❌ Silakan unggah file PDF tugas Anda');
            return;
        }
        if (submissionType === 'BOTH' && !answer.trim() && !file && !fileUrl) {
            setMsg('❌ Silakan tulis jawaban teks dan unggah file PDF');
            return;
        }

        startTransition(async () => {
            setMsg('');
            let finalFileUrl = fileUrl;

            // Jika ada file baru yang dipilih, unggah terlebih dahulu
            if (file) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    const uploadData = await uploadRes.json();
                    if (!uploadRes.ok || uploadData.error) {
                        setMsg('❌ Gagal mengunggah file: ' + (uploadData.error || 'Terjadi kesalahan'));
                        return;
                    }
                    finalFileUrl = uploadData.fileUrl;
                    setFileUrl(finalFileUrl);
                } catch (err: any) {
                    setMsg('❌ Gagal mengunggah file: ' + err.message);
                    return;
                }
            }

            const res = await submitAssignment(assignment.id, answer, finalFileUrl);
            if (res.error) setMsg('❌ ' + res.error);
            else {
                setMsg('✓ ' + res.message);
                setFile(null);
                window.location.reload();
            }
        });
    };

    return (
        <div className={`glass-panel rounded-2xl overflow-hidden ${submitted ? 'ring-2 ring-blue-500/20' : ''}`}>
            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            {graded ? (
                                <span className="flex items-center gap-1 text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full">
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
                            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full">
                                Tipe: {submissionType === 'TEXT' ? 'Teks' : submissionType === 'FILE' ? 'File PDF' : 'Teks & PDF'}
                            </span>
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

                    {/* Lampiran Soal dari Guru */}
                    {assignment.attachmentUrl && (
                        <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100/30 dark:border-blue-900/30">
                            <p className="text-xs font-bold text-blue-500 uppercase mb-2">Lampiran Tugas</p>
                            <a 
                                href={assignment.attachmentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                            >
                                📥 Download Lampiran Tugas ({assignment.attachmentUrl.split('/').pop()})
                            </a>
                        </div>
                    )}

                    {/* Feedback jika sudah dinilai */}
                    {graded && assignment.mySubmission?.feedback && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                            <p className="text-xs font-bold text-blue-600 uppercase mb-1">Feedback Guru</p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">{assignment.mySubmission.feedback}</p>
                        </div>
                    )}

                    {/* File PDF terlampir jika sudah dikumpulkan */}
                    {submitted && assignment.mySubmission?.fileUrl && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-blue-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-500 uppercase">File Terlampir</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                                        {assignment.mySubmission.fileUrl.split('/').pop() || 'tugas.pdf'}
                                    </p>
                                </div>
                            </div>
                            <a href={assignment.mySubmission.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm transition-colors">
                                Buka PDF ↗
                            </a>
                        </div>
                    )}

                    {/* Jawaban Teks terkirim jika sudah dikumpulkan */}
                    {submitted && assignment.mySubmission?.content && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Jawaban Teks Anda</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{assignment.mySubmission.content}</p>
                        </div>
                    )}

                    {/* Form input pengumpulan jika belum dinilai */}
                    {!graded && (
                        <div className="space-y-4">
                            {/* Input Teks */}
                            {(submissionType === 'TEXT' || submissionType === 'BOTH') && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase block">Jawaban Teks</label>
                                    <textarea
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                        rows={5}
                                        placeholder="Tuliskan jawaban Anda di sini..."
                                        disabled={isOverdue && !submitted}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            )}

                            {/* Input File */}
                            {(submissionType === 'FILE' || submissionType === 'BOTH') && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase block">File Lampiran (PDF)</label>
                                    {!(isOverdue && !submitted) ? (
                                        <div className="flex items-center gap-3">
                                            <label className="cursor-pointer px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2">
                                                <FileText size={14} />
                                                Pilih File PDF
                                                <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                                            </label>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                                                {file ? file.name : fileUrl ? fileUrl.split('/').pop() : 'Belum ada file terpilih'}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">File tidak dapat diunggah setelah tenggat waktu.</p>
                                    )}
                                </div>
                            )}

                            {msg && <p className={`text-sm font-medium ${msg.startsWith('✓') ? 'text-blue-600' : 'text-red-500'}`}>{msg}</p>}
                            
                            {!(isOverdue && !submitted) && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isPending}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm disabled:opacity-50 transition-colors shadow-[0_4px_12px_rgba(37,99,235,0.3)] w-fit"
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

function QuizListTab({ quizzes, weekModules }: { quizzes: any[]; weekModules: any[] }) {
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
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

    const unassigned = quizzes.filter(q => !q.weekModuleId);
    const hasWeeks = weekModules.length > 0;

    const QuizCard = ({ quiz }: { quiz: any }) => {
        const attempt = quiz.myAttempt;
        const done = !!attempt?.submittedAt;
        const totalPoints = quiz.questions?.reduce((s: number, q: any) => s + q.points, 0) ?? 0;
        const deadline = quiz.deadline ? new Date(quiz.deadline) : null;
        const now = new Date();
        const isExpired = deadline ? deadline < now : false;
        const hoursLeft = deadline ? (deadline.getTime() - now.getTime()) / 3600000 : null;
        const canTake = !isExpired;

        const maxAttempts = quiz.maxAttempts ?? 1;
        const attemptsCount = attempt?.attemptsCount ?? 0;
        const canRetake = done && (maxAttempts === 0 || attemptsCount < maxAttempts);

        const handleRetake = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!confirm("Apakah Anda yakin ingin mengerjakan ulang quiz ini? Jawaban dan nilai sebelumnya akan dihapus.")) return;
            startTransition(async () => {
                const res = await retakeQuiz(quiz.id);
                if (res.error) {
                    alert(res.error);
                } else {
                    setSelectedQuizId(quiz.id);
                }
            });
        };

        let deadlineBadge = null;
        if (deadline) {
            if (isExpired) {
                deadlineBadge = (<span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 font-medium"><Clock size={11} /> Tutup: {deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>);
            } else if (hoursLeft !== null && hoursLeft < 24) {
                deadlineBadge = (<span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium animate-pulse"><Clock size={11} /> Tutup: {deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} ({Math.ceil(hoursLeft)}j lagi)</span>);
            } else {
                deadlineBadge = (<span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"><Clock size={11} /> Tenggat: {deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>);
            }
        }

        return (
            <div key={quiz.id} className={`glass-panel rounded-2xl p-5 flex items-center justify-between gap-4 hover-lift ${done ? 'ring-2 ring-blue-500/20' : isExpired && !done ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={done ? 'w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-100 dark:bg-blue-500/20 text-blue-600 shrink-0' : 'w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 shrink-0'}>
                        {done ? <CheckCircle2 size={24} /> : <CheckSquare size={24} />}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{quiz.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{quiz.questions?.length ?? 0} soal &middot; {totalPoints} poin</span>
                            {quiz.timeLimit && <span className="text-xs text-slate-500">⏱ {quiz.timeLimit} menit</span>}
                            {done && (
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    Skor: {attempt.score}/{totalPoints} {attempt.attemptsCount > 1 ? `(Percobaan ke-${attempt.attemptsCount})` : ''}
                                </span>
                            )}
                            {quiz.maxAttempts > 0 && (
                                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    Maks Percobaan: {quiz.maxAttempts}x
                                </span>
                            )}
                            {deadlineBadge}
                        </div>
                    </div>
                </div>
                {canTake || done ? (
                    <div className="flex gap-2 shrink-0">
                        {done && (
                            <button onClick={() => setSelectedQuizId(quiz.id)} className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 transition-all">
                                Lihat Hasil
                            </button>
                        )}
                        {canRetake && (
                            <button onClick={handleRetake} disabled={isPending} className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50">
                                {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                                Kerjakan Ulang
                            </button>
                        )}
                        {!done && (
                            <button onClick={() => setSelectedQuizId(quiz.id)} className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all">
                                Kerjakan Quiz
                            </button>
                        )}
                    </div>
                ) : (
                    <span className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-red-50 dark:bg-red-500/10 text-red-500 shrink-0 cursor-not-allowed">Waktu Habis</span>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Quiz tanpa modul */}
            {unassigned.length > 0 && (
                <div className="space-y-3">
                    {hasWeeks && <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Umum</p>}
                    {unassigned.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)}
                </div>
            )}

            {/* Per modul minggu */}
            {weekModules.map((wm: any) => {
                const wQuizzes = quizzes.filter(q => q.weekModuleId === wm.id);
                return (
                    <div key={wm.id} className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-7 h-7 rounded-lg accent-bg text-white text-xs font-bold flex items-center justify-center shrink-0">{wm.weekNumber}</div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1">{wm.title}</p>
                            <span className="text-xs text-slate-400">{wQuizzes.length} quiz</span>
                        </div>
                        <div className="ml-9 h-px bg-slate-100 dark:bg-slate-800" />
                        {wQuizzes.length === 0 ? (
                            <p className="text-xs text-slate-400 italic pl-9">Belum ada quiz di modul ini.</p>
                        ) : (
                            wQuizzes.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)
                        )}
                    </div>
                );
            })}
        </div>
    );
}
