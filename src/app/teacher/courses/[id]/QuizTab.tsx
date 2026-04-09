"use client";

import { useState, useTransition } from 'react';
import {
    Plus, Trash, Pencil, CheckSquare, FileText, AlignJustify,
    Loader2, ChevronDown, ChevronUp, Eye, EyeOff, Clock, Star, X, Check
} from 'lucide-react';
import { createQuiz, updateQuiz, deleteQuiz, addQuestion, deleteQuestion, gradeEssayAnswer } from '@/actions/quiz';

const TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
    MULTIPLE_CHOICE: { label: 'Pilihan Ganda', icon: CheckSquare, color: 'blue' },
    ESSAY: { label: 'Esai', icon: AlignJustify, color: 'purple' },
    SHORT_ANSWER: { label: 'Jawaban Singkat', icon: FileText, color: 'emerald' },
};

export default function QuizTab({ courseId, quizzes }: { courseId: string; quizzes: any[] }) {
    const [showCreate, setShowCreate] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [msg, setMsg] = useState('');

    const handleCreate = () => {
        if (!title.trim()) return;
        startTransition(async () => {
            setMsg('');
            const res = await createQuiz(courseId, title, desc, timeLimit ? parseInt(timeLimit) : null);
            if (res.error) setMsg('❌ ' + res.error);
            else { setMsg('✓ Quiz berhasil dibuat!'); setTitle(''); setDesc(''); setTimeLimit(''); setShowCreate(false); }
        });
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{quizzes.length} quiz tersedia</p>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all">
                    <Plus size={16} /> Buat Quiz Baru
                </button>
            </div>

            {msg && <div className={`p-3 text-sm font-medium rounded-xl border ${msg.startsWith('✓') ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-600 border-red-200'}`}>{msg}</div>}

            {/* Create Quiz Form */}
            {showCreate && (
                <div className="glass-panel rounded-2xl p-5 border border-indigo-200 dark:border-indigo-500/30">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Quiz Baru</h3>
                        <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>
                    </div>
                    <div className="space-y-3">
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul Quiz (contoh: Quiz Bab 1 — Algoritma Dasar)" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Deskripsi/instruksi quiz (opsional)" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <Clock size={16} className="text-slate-400" />
                                <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="Batas waktu (menit, kosongkan = bebas)" className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <button onClick={handleCreate} disabled={!title.trim() || isPending} className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
                                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {quizzes.length === 0 && !showCreate ? (
                <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                    <CheckSquare size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Belum ada quiz. Buat quiz pertama untuk menguji pemahaman murid!</p>
                </div>
            ) : (
                quizzes.map(quiz => (
                    <QuizCard key={quiz.id} quiz={quiz} courseId={courseId} />
                ))
            )}
        </div>
    );
}

function QuizCard({ quiz, courseId }: { quiz: any; courseId: string }) {
    const [expanded, setExpanded] = useState(false);
    const [showAddQ, setShowAddQ] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState('');

    // Question form state
    const [qType, setQType] = useState<'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER'>('MULTIPLE_CHOICE');
    const [qText, setQText] = useState('');
    const [qPoints, setQPoints] = useState('10');
    const [qOptions, setQOptions] = useState(['', '', '', '']);
    const [qCorrect, setQCorrect] = useState('0');
    const [qShortAnswer, setQShortAnswer] = useState('');

    const handleTogglePublish = () => {
        startTransition(async () => {
            await updateQuiz(quiz.id, courseId, quiz.title, quiz.description || '', quiz.timeLimit, !quiz.isPublished);
        });
    };

    const handleDelete = () => {
        if (!confirm(`Hapus quiz "${quiz.title}"? Semua soal dan jawaban murid akan hilang.`)) return;
        startTransition(async () => { await deleteQuiz(quiz.id, courseId); });
    };

    const handleAddQuestion = () => {
        if (!qText.trim()) return;
        startTransition(async () => {
            setMsg('');
            const res = await addQuestion({
                quizId: quiz.id,
                courseId,
                text: qText,
                type: qType,
                options: qType === 'MULTIPLE_CHOICE' ? qOptions : undefined,
                correctAnswer: qType === 'MULTIPLE_CHOICE' ? qCorrect : qType === 'SHORT_ANSWER' ? qShortAnswer : undefined,
                points: parseInt(qPoints) || 10
            });
            if (res.error) setMsg('❌ ' + res.error);
            else { setMsg('✓ Soal ditambahkan!'); setQText(''); setQOptions(['', '', '', '']); setQCorrect('0'); setQShortAnswer(''); setShowAddQ(false); }
        });
    };

    const totalPoints = quiz.questions?.reduce((s: number, q: any) => s + q.points, 0) ?? 0;
    const totalAttempts = quiz.attempts?.length ?? 0;

    return (
        <div className="glass-panel rounded-2xl overflow-hidden">
            {/* Quiz Header */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{quiz.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${quiz.isPublished ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                {quiz.isPublished ? '● Dipublikasikan' : '○ Draf'}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>{quiz.questions?.length ?? 0} soal</span>
                            <span>{totalPoints} poin total</span>
                            {quiz.timeLimit && <span className="flex items-center gap-1"><Clock size={11} /> {quiz.timeLimit} menit</span>}
                            <span>{totalAttempts} percobaan murid</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={handleTogglePublish} disabled={isPending} title={quiz.isPublished ? 'Sembunyikan dari murid' : 'Publikasikan ke murid'} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${quiz.isPublished ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-emerald-600'}`}>
                            {quiz.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button onClick={handleDelete} className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors"><Trash size={15} /></button>
                        <button onClick={() => setExpanded(!expanded)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 dark:border-slate-700/50 p-5 space-y-5">
                    {/* Question List */}
                    <div className="space-y-3">
                        {quiz.questions?.length === 0 ? (
                            <p className="text-sm text-slate-400 italic text-center py-4">Belum ada soal. Tambahkan soal pertama!</p>
                        ) : (
                            quiz.questions?.map((q: any, idx: number) => {
                                const TypeIcon = TYPE_LABELS[q.type]?.icon ?? CheckSquare;
                                return (
                                    <div key={q.id} className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                                        <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{idx+1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{q.text}</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs px-2 py-0.5 rounded-full bg-${TYPE_LABELS[q.type]?.color}-100 dark:bg-${TYPE_LABELS[q.type]?.color}-500/20 text-${TYPE_LABELS[q.type]?.color}-700 dark:text-${TYPE_LABELS[q.type]?.color}-400 font-medium flex items-center gap-1`}>
                                                    <TypeIcon size={11} /> {TYPE_LABELS[q.type]?.label}
                                                </span>
                                                <span className="text-xs text-slate-400">{q.points} poin</span>
                                                {q.type === 'MULTIPLE_CHOICE' && q.options && (
                                                    <span className="text-xs text-slate-400">Jawaban benar: {['A','B','C','D'][parseInt(q.correctAnswer ?? '0')]}</span>
                                                )}
                                            </div>
                                            {q.type === 'MULTIPLE_CHOICE' && q.options && (
                                                <div className="mt-2 grid grid-cols-2 gap-1">
                                                    {(q.options as string[]).map((opt, i) => (
                                                        <span key={i} className={`text-xs px-2 py-1 rounded-lg ${String(i) === q.correctAnswer ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}>
                                                            {['A','B','C','D'][i]}. {opt}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => { if(confirm('Hapus soal ini?')) startTransition(async() => { await deleteQuestion(q.id, courseId); }); }} className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0">
                                            <Trash size={13} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Add Question Form */}
                    {showAddQ ? (
                        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Tambah Soal Baru</h4>
                                <button onClick={() => setShowAddQ(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                            </div>

                            {/* Type Selector */}
                            <div className="flex gap-2">
                                {(['MULTIPLE_CHOICE', 'ESSAY', 'SHORT_ANSWER'] as const).map(t => (
                                    <button key={t} onClick={() => setQType(t)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${qType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-400'}`}>
                                        {(() => { const Icon = TYPE_LABELS[t].icon; return <Icon size={12} />; })()}
                                        {TYPE_LABELS[t].label}
                                    </button>
                                ))}
                            </div>

                            {/* Question Text */}
                            <textarea value={qText} onChange={e => setQText(e.target.value)} rows={3} placeholder="Tulis soal/pertanyaan di sini..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />

                            {/* Options for MC */}
                            {qType === 'MULTIPLE_CHOICE' && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Pilihan Jawaban</p>
                                    {qOptions.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <button onClick={() => setQCorrect(String(i))} className={`w-7 h-7 rounded-full border-2 text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${qCorrect === String(i) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400 hover:border-emerald-400'}`}>
                                                {['A','B','C','D'][i]}
                                            </button>
                                            <input value={opt} onChange={e => { const newOpts = [...qOptions]; newOpts[i] = e.target.value; setQOptions(newOpts); }} placeholder={`Opsi ${['A','B','C','D'][i]}`} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                    ))}
                                    <p className="text-xs text-slate-400 italic">* Klik huruf untuk memilih jawaban yang benar</p>
                                </div>
                            )}

                            {/* Correct answer for Short Answer */}
                            {qType === 'SHORT_ANSWER' && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Kunci Jawaban (case-insensitive)</label>
                                    <input value={qShortAnswer} onChange={e => setQShortAnswer(e.target.value)} placeholder="Jawaban yang diterima..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            )}

                            {qType === 'ESSAY' && (
                                <p className="text-xs text-slate-400 italic bg-purple-50 dark:bg-purple-500/10 p-3 rounded-xl">Esai akan dinilai secara manual oleh guru setelah murid menjawab.</p>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Star size={14} className="text-amber-500" />
                                    <input type="number" value={qPoints} onChange={e => setQPoints(e.target.value)} min="1" className="w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    <span className="text-xs text-slate-500">poin</span>
                                </div>
                                {msg && <span className={`text-xs font-medium ${msg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</span>}
                                <button onClick={handleAddQuestion} disabled={!qText.trim() || isPending} className="ml-auto px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
                                    {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Tambah Soal
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setShowAddQ(true)} className="w-full py-3 border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                            <Plus size={16} /> Tambah Soal
                        </button>
                    )}

                    {/* Student Attempts Overview */}
                    {quiz.attempts?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-3">Hasil Murid ({quiz.attempts.length})</p>
                            <div className="space-y-2">
                                {quiz.attempts.map((attempt: any) => (
                                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${attempt.user?.name}`} alt="" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">{attempt.user?.name}</p>
                                                <p className="text-xs text-slate-400">{attempt.submittedAt ? 'Selesai' : 'Sedang mengerjakan'}</p>
                                            </div>
                                        </div>
                                        {attempt.submittedAt ? (
                                            <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                                                {attempt.score ?? '?'}/{totalPoints}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-amber-500">Belum selesai</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
