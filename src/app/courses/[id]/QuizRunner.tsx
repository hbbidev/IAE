"use client";

import { useState, useEffect, useTransition } from 'react';
import { CheckSquare, AlignJustify, FileText, Clock, Star, Loader2, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { startQuiz, submitQuiz } from '@/actions/quiz';

const TYPE_ICONS: Record<string, any> = {
    MULTIPLE_CHOICE: CheckSquare,
    ESSAY: AlignJustify,
    SHORT_ANSWER: FileText,
};

export default function QuizRunner({ quiz, previousAttempt }: { quiz: any; previousAttempt: any | null }) {
    const [phase, setPhase] = useState<'intro' | 'taking' | 'result'>(previousAttempt?.submittedAt ? 'result' : 'intro');
    const [attemptId, setAttemptId] = useState<string | null>(previousAttempt?.id ?? null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(quiz.timeLimit ? quiz.timeLimit * 60 : null);
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ score: number } | null>(
        previousAttempt?.submittedAt ? { score: previousAttempt.score ?? 0 } : null
    );
    const [error, setError] = useState('');

    const questions = quiz.questions ?? [];
    const totalPoints = questions.reduce((s: number, q: any) => s + q.points, 0);

    // Timer countdown
    useEffect(() => {
        if (phase !== 'taking' || timeLeft === null) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        const t = setInterval(() => setTimeLeft(prev => (prev ?? 1) - 1), 1000);
        return () => clearInterval(t);
    }, [phase, timeLeft]);

    const handleStart = () => {
        startTransition(async () => {
            const res = await startQuiz(quiz.id);
            if (res.error) { setError(res.error); return; }
            setAttemptId(res.attemptId!);
            // Pre-fill answers dari attempt sebelumnya jika ada
            if (previousAttempt?.answers) {
                const prev: Record<string, string> = {};
                previousAttempt.answers.forEach((a: any) => { prev[a.questionId] = a.answer ?? ''; });
                setAnswers(prev);
            }
            setPhase('taking');
        });
    };

    const handleSubmit = () => {
        if (!attemptId) return;
        startTransition(async () => {
            const answerList = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
            const res = await submitQuiz(attemptId, answerList);
            if (res.error) { setError(res.error); return; }
            setResult({ score: res.score ?? 0 });
            setPhase('result');
        });
    };

    const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
    const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
    const answered = Object.keys(answers).filter(k => answers[k]?.trim()).length;

    if (phase === 'intro') return (
        <div className="glass-panel rounded-3xl p-8 flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <CheckSquare size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{quiz.title}</h2>
            {quiz.description && <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{quiz.description}</p>}
            <div className="grid grid-cols-3 gap-4 w-full mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{questions.length}</span>
                    <span className="text-xs text-slate-500">Soal</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{totalPoints}</span>
                    <span className="text-xs text-slate-500">Total Poin</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{quiz.timeLimit ?? '∞'}</span>
                    <span className="text-xs text-slate-500">{quiz.timeLimit ? 'Menit' : 'Waktu Bebas'}</span>
                </div>
            </div>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <button onClick={handleStart} disabled={isPending} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {isPending ? <Loader2 size={20} className="animate-spin" /> : <><CheckSquare size={20} /> Mulai Mengerjakan Quiz</>}
            </button>
        </div>
    );

    if (phase === 'result') return (
        <div className="glass-panel rounded-3xl p-8 flex flex-col items-center text-center max-w-lg mx-auto">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${(result?.score ?? 0) / totalPoints >= 0.7 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600'}`}>
                {(result?.score ?? 0) / totalPoints >= 0.7 ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                {(result?.score ?? 0) / totalPoints >= 0.7 ? 'Quiz Selesai! 🎉' : 'Quiz Selesai'}
            </h2>
            <p className="text-slate-500 mb-6">Hasil pengerjaan quiz <strong>{quiz.title}</strong></p>
            <div className="text-center mb-6">
                <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{result?.score ?? 0}</div>
                <div className="text-slate-500 text-sm mt-1">dari {totalPoints} poin</div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2">
                <div className={`h-3 rounded-full transition-all ${(result?.score ?? 0) / totalPoints >= 0.7 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.round(((result?.score ?? 0) / totalPoints) * 100)}%` }} />
            </div>
            <p className="text-sm text-slate-500">{Math.round(((result?.score ?? 0) / totalPoints) * 100)}%</p>
            {previousAttempt && previousAttempt.answers?.some((a: any) => a.question?.type === 'ESSAY' && a.score === null) && (
                <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                    ⚠️ Soal esai akan dinilai manual oleh guru. Skor final akan diperbarui setelah penilaian.
                </div>
            )}
        </div>
    );

    // TAKING phase
    const q = questions[currentQ];
    if (!q) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            {/* Progress Header */}
            <div className="glass-panel rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Soal {currentQ + 1} dari {questions.length}</span>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{answered}/{questions.length} dijawab</span>
                        {timeLeft !== null && (
                            <span className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                                <Clock size={14} /> {formatTime(timeLeft)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Question Card */}
            <div className="glass-panel rounded-2xl p-6 space-y-5">
                <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-sm font-bold flex items-center justify-center shrink-0">{currentQ + 1}</span>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {(() => { const Icon = TYPE_ICONS[q.type] ?? CheckSquare; return <Icon size={14} className="text-slate-400" />; })()}
                            <span className="text-xs text-slate-400 font-medium">{q.type === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : q.type === 'ESSAY' ? 'Esai' : 'Jawaban Singkat'} · {q.points} poin</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{q.text}</p>
                    </div>
                </div>

                {/* Answer Input */}
                {q.type === 'MULTIPLE_CHOICE' && q.options && (
                    <div className="space-y-2">
                        {(q.options as string[]).map((opt: string, i: number) => (
                            <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: String(i) }))}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${answers[q.id] === String(i) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800'}`}
                            >
                                <span className={`w-7 h-7 rounded-full border-2 text-xs font-bold flex items-center justify-center shrink-0 ${answers[q.id] === String(i) ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-500'}`}>
                                    {['A','B','C','D'][i]}
                                </span>
                                <span className={`text-sm ${answers[q.id] === String(i) ? 'text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>{opt}</span>
                            </button>
                        ))}
                    </div>
                )}

                {(q.type === 'ESSAY') && (
                    <textarea value={answers[q.id] ?? ''} onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        rows={6} placeholder="Tuliskan jawaban esai Anda di sini..."
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                )}

                {q.type === 'SHORT_ANSWER' && (
                    <input value={answers[q.id] ?? ''} onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Ketikkan jawaban singkat Anda..."
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm disabled:opacity-40">
                    <ChevronLeft size={16} /> Sebelumnya
                </button>

                <div className="flex gap-1.5">
                    {questions.map((_: any, i: number) => (
                        <button key={i} onClick={() => setCurrentQ(i)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${i === currentQ ? 'bg-indigo-600 text-white' : answers[questions[i]?.id]?.trim() ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {i + 1}
                        </button>
                    ))}
                </div>

                {currentQ < questions.length - 1 ? (
                    <button onClick={() => setCurrentQ(currentQ + 1)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:-translate-y-0.5 transition-all">
                        Selanjutnya <ChevronRight size={16} />
                    </button>
                ) : (
                    <button onClick={handleSubmit} disabled={isPending} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 shadow-[0_4px_12px_rgba(5,150,105,0.3)]">
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Kumpulkan Quiz
                    </button>
                )}
            </div>
        </div>
    );
}
