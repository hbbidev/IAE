"use client";

import { useState, useTransition } from 'react';
import { Users, UserPlus, Trash, Loader2, X, GraduationCap, CheckCircle2 } from 'lucide-react';
import { adminEnrollStudent, adminUnenrollStudent } from '@/actions/enrollment';

type Student = { id: string; name: string; nim: string | null };
type Enrollment = { userId: string; user: { name: string; nim: string | null } };

export default function CourseEnrollPanel({
    courseId,
    courseTitle,
    enrollments,
    students,
    onClose
}: {
    courseId: string;
    courseTitle: string;
    enrollments: Enrollment[];
    students: Student[];
    onClose: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');

    const enrolledIds = new Set(enrollments.map(e => e.userId));
    const availableStudents = students.filter(s => !enrolledIds.has(s.id));

    const handleEnroll = () => {
        if (!selectedStudentId) return;
        setFeedback('');
        startTransition(async () => {
            const res = await adminEnrollStudent(selectedStudentId, courseId);
            if (res.error) setFeedback(res.error);
            else { setFeedback('✓ ' + res.message); setSelectedStudentId(''); }
        });
    };

    const handleUnenroll = (studentId: string) => {
        startTransition(async () => {
            const res = await adminUnenrollStudent(studentId, courseId);
            if (res.error) setFeedback(res.error);
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Users className="text-purple-500" size={20} /> Peserta Kursus
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{courseTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-50 dark:bg-slate-800 rounded-full p-1.5 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Add Student */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                        Tambahkan Siswa ke Kursus
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={selectedStudentId}
                            onChange={e => setSelectedStudentId(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">-- Pilih Siswa --</option>
                            {availableStudents.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.nim})</option>
                            ))}
                        </select>
                        <button
                            onClick={handleEnroll}
                            disabled={!selectedStudentId || isPending}
                            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors shrink-0"
                        >
                            {isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                            Tambah
                        </button>
                    </div>
                    {feedback && (
                        <p className={`mt-2 text-xs font-medium ${feedback.startsWith('✓') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            {feedback}
                        </p>
                    )}
                    {availableStudents.length === 0 && (
                        <p className="mt-2 text-xs text-slate-400 italic">Semua siswa sudah terdaftar di kursus ini.</p>
                    )}
                </div>

                {/* Enrolled List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                        Peserta Terdaftar ({enrollments.length})
                    </p>
                    {enrollments.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <GraduationCap size={32} className="mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Belum ada peserta</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {enrollments.map(e => (
                                <div key={e.userId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${e.user.name}`} alt="" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{e.user.name}</p>
                                            <p className="text-xs text-slate-400 font-mono">{e.user.nim}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUnenroll(e.userId)}
                                        disabled={isPending}
                                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors disabled:opacity-40"
                                        title="Hapus dari kursus"
                                    >
                                        <Trash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
