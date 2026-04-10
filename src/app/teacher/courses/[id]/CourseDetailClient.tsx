"use client";

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, BookOpen, ClipboardList, Users, Plus, X, Loader2,
    Pencil, Trash, FileText, ChevronDown, ChevronUp, Star,
    Clock, CheckCircle2, AlertCircle, CalendarDays, MapPin, FolderOpen
} from 'lucide-react';
import { createLesson, updateLesson, deleteLesson } from '@/actions/lesson';
import { createAssignment, updateAssignment, deleteAssignment, gradeSubmission } from '@/actions/assignment';
import { createWeekModule, deleteWeekModule } from '@/actions/weekModule';
import { createSchedule, deleteSchedule } from '@/actions/weekModule';
import QuizTab from './QuizTab';

type TabId = 'materi' | 'tugas' | 'peserta' | 'quiz' | 'jadwal';

export default function CourseDetailClient({ course }: { course: any }) {
    const [activeTab, setActiveTab] = useState<TabId>('materi');

    const tabs: { id: TabId; label: string; icon: any; count?: number }[] = [
        { id: 'materi', label: 'Materi', icon: BookOpen, count: course.lessons.length },
        { id: 'tugas', label: 'Tugas', icon: ClipboardList, count: course.assignments.length },
        { id: 'peserta', label: 'Peserta & Nilai', icon: Users, count: course.enrollments.length },
        { id: 'quiz', label: 'Quiz', icon: CheckCircle2, count: course.quizzes?.length ?? 0 },
        { id: 'jadwal', label: 'Jadwal', icon: CalendarDays, count: course.schedules?.length ?? 0 },
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back + Header */}
            <div className="mb-6">
                <Link href="/teacher/courses" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4 transition-colors font-medium">
                    <ArrowLeft size={16} /> Kembali ke Daftar Kursus
                </Link>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{course.title}</h1>
                {course.description && <p className="text-slate-500 mt-1 text-sm">{course.description}</p>}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-6 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                            ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1">
                {activeTab === 'materi' && <MateriTab courseId={course.id} lessons={course.lessons} weekModules={course.weekModules ?? []} />}
                {activeTab === 'tugas' && <TugasTab courseId={course.id} assignments={course.assignments} weekModules={course.weekModules ?? []} />}
                {activeTab === 'peserta' && <PesertaTab courseId={course.id} enrollments={course.enrollments} assignments={course.assignments} />}
                {activeTab === 'quiz' && <QuizTab courseId={course.id} quizzes={course.quizzes ?? []} weekModules={course.weekModules ?? []} />}
                {activeTab === 'jadwal' && <JadwalTab courseId={course.id} schedules={course.schedules ?? []} />}
            </div>
        </div>
    );
}

// ============ TAB MATERI ============
function MateriTab({ courseId, lessons, weekModules }: { courseId: string; lessons: any[]; weekModules: any[] }) {
    const [showForm, setShowForm] = useState(false);
    const [editLesson, setEditLesson] = useState<any>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showWeekForm, setShowWeekForm] = useState(false);
    const [weekTitle, setWeekTitle] = useState('');
    const [weekNumber, setWeekNumber] = useState(String((weekModules.length || 0) + 1));
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        data.append('courseId', courseId);
        if (editLesson) data.append('id', editLesson.id);

        startTransition(async () => {
            setErr(''); setMsg('');
            const res = editLesson ? await updateLesson(null, data) : await createLesson(null, data);
            if (res.error) setErr(res.error);
            else { setMsg(res.message || 'Berhasil!'); form.reset(); setShowForm(false); setEditLesson(null); }
        });
    };

    const handleAddWeek = () => {
        if (!weekTitle.trim()) return;
        const data = new FormData();
        data.append('courseId', courseId);
        data.append('weekNumber', weekNumber);
        data.append('title', weekTitle);
        startTransition(async () => {
            setErr(''); setMsg('');
            const res = await createWeekModule(null, data);
            if (res.error) setErr(res.error);
            else { setMsg(res.message || 'Berhasil!'); setShowWeekForm(false); setWeekTitle(''); setWeekNumber(String(weekModules.length + 2)); }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{lessons.length} materi &bull; {weekModules.length} modul minggu</p>
                <div className="flex gap-2">
                    <button onClick={() => { setShowWeekForm(v => !v); }} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl transition-all">
                        <FolderOpen size={15} /> Tambah Minggu
                    </button>
                    <button onClick={() => { setShowForm(true); setEditLesson(null); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(5,150,105,0.3)] hover:-translate-y-0.5 transition-all">
                        <Plus size={16} /> Tambah Materi
                    </button>
                </div>
            </div>

            {msg && <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20">{msg}</div>}
            {err && <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200">{err}</div>}

            {/* Add Week Form */}
            {showWeekForm && (
                <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Tambah Modul Minggu</p>
                    <div className="flex gap-2">
                        <input type="number" value={weekNumber} onChange={e => setWeekNumber(e.target.value)} placeholder="No." min="1" className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        <input value={weekTitle} onChange={e => setWeekTitle(e.target.value)} placeholder="Judul minggu (contoh: Pendahuluan & Konsep Dasar)" className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        <button onClick={handleAddWeek} disabled={!weekTitle.trim() || isPending} className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
                            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Simpan
                        </button>
                        <button onClick={() => setShowWeekForm(false)} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl text-sm"><X size={14} /></button>
                    </div>
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="glass-panel rounded-2xl p-5 border border-emerald-200 dark:border-emerald-500/30">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{editLesson ? 'Sunting Materi' : 'Materi Baru'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Judul Materi</label>
                            <input name="title" defaultValue={editLesson?.title} required placeholder="contoh: Pengenalan Variabel" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Link Video (Opsional)</label>
                            <input name="videoUrl" defaultValue={editLesson?.videoUrl || ''} placeholder="https://youtube.com/..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Konten / Penjelasan Materi</label>
                            <textarea name="content" defaultValue={editLesson?.content} required rows={6} placeholder="Tuliskan penjelasan materi di sini..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none" />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" disabled={isPending} className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
                                {isPending ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Simpan</>}
                            </button>
                            <button type="button" onClick={() => { setShowForm(false); setEditLesson(null); }} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm">Batal</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lesson List — grouped by week */}
            {lessons.length === 0 && !showForm ? (
                <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Belum ada materi. Tambahkan materi pertama!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Lessons tanpa minggu */}
                    {(() => {
                        const unassigned = lessons.filter(l => !l.weekModuleId);
                        if (unassigned.length === 0) return null;
                        return (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanpa Modul</p>
                                {unassigned.map((lesson, idx) => <LessonRow key={lesson.id} lesson={lesson} idx={idx} expandedId={expandedId} setExpandedId={setExpandedId} onEdit={(l: any) => { setEditLesson(l); setShowForm(true); }} onDelete={(l: any) => { if(confirm('Hapus materi ini?')) startTransition(async() => { await deleteLesson(l.id, courseId); }); }} courseId={courseId} isPending={isPending} startTransition={startTransition} />)}
                            </div>
                        );
                    })()}

                    {/* Per minggu */}
                    {weekModules.map((wm: any) => {
                        const wLessons = lessons.filter(l => l.weekModuleId === wm.id);
                        return (
                            <div key={wm.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">{wm.weekNumber}</span>
                                        <p className="font-semibold text-slate-700 dark:text-slate-200">{wm.title}</p>
                                        <span className="text-xs text-slate-400">{wLessons.length} materi</span>
                                    </div>
                                    <button onClick={() => { if(confirm(`Hapus modul "${wm.title}"?`)) startTransition(async () => { await deleteWeekModule(wm.id, courseId); }); }} className="w-6 h-6 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors">
                                        <Trash size={12} />
                                    </button>
                                </div>
                                {wLessons.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic pl-9">Belum ada materi di minggu ini.</p>
                                ) : (
                                    wLessons.map((lesson, idx) => <LessonRow key={lesson.id} lesson={lesson} idx={idx} expandedId={expandedId} setExpandedId={setExpandedId} onEdit={(l: any) => { setEditLesson(l); setShowForm(true); }} onDelete={(l: any) => { if(confirm('Hapus materi ini?')) startTransition(async() => { await deleteLesson(l.id, courseId); }); }} courseId={courseId} isPending={isPending} startTransition={startTransition} />)
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── LessonRow ─────────────────────────────────────────────────────────────────
function LessonRow({ lesson, idx, expandedId, setExpandedId, onEdit, onDelete }: any) {
    return (
        <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}>
                <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{lesson.title}</span>
                    {lesson.videoUrl && <span className="text-xs bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">Video</span>}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(lesson); }} className="w-7 h-7 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center justify-center transition-colors"><Pencil size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(lesson); }} className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors"><Trash size={14} /></button>
                    {expandedId === lesson.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
            </div>
            {expandedId === lesson.id && (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700/50 pt-4">
                    {lesson.videoUrl && (
                        <div className="mb-3">
                            <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:underline font-medium">
                                ▶ Tonton Video Materi
                            </a>
                        </div>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{lesson.content}</p>
                </div>
            )}
        </div>
    );
}

// ============ TAB JADWAL ============
const DAY_NAMES_SHORT = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function JadwalTab({ courseId, schedules }: { courseId: string; schedules: any[] }) {
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        data.append('courseId', courseId);

        startTransition(async () => {
            setErr(''); setMsg('');
            const res = await createSchedule(null, data);
            if (res.error) setErr(res.error);
            else { setMsg(res.message || 'Berhasil!'); form.reset(); setShowForm(false); }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{schedules.length} jadwal pertemuan</p>
                <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-all">
                    <Plus size={16} /> Tambah Jadwal
                </button>
            </div>

            {msg && <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl border border-emerald-200">{msg}</div>}
            {err && <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200">{err}</div>}

            {showForm && (
                <div className="glass-panel rounded-2xl p-5 border border-amber-200 dark:border-amber-500/30">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Jadwal Pertemuan Baru</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Hari</label>
                                <select name="dayOfWeek" required className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                                    {DAY_NAMES_SHORT.slice(1).map((d, i) => (
                                        <option key={i+1} value={i+1}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Jam Mulai</label>
                                <input type="time" name="startTime" required className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Jam Selesai</label>
                                <input type="time" name="endTime" required className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Ruangan (Opsional)</label>
                                <input name="room" placeholder="contoh: Lab 01, Room 304" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Catatan (Opsional)</label>
                                <input name="note" placeholder="contoh: Online via Zoom" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" disabled={isPending} className="px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
                                {isPending ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Simpan Jadwal</>}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm">Batal</button>
                        </div>
                    </form>
                </div>
            )}

            {schedules.length === 0 && !showForm ? (
                <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                    <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Belum ada jadwal. Tambahkan jadwal pertemuan untuk kursus ini!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {[...schedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)).map((sched: any) => (
                        <div key={sched.id} className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                                    {DAY_NAMES_SHORT[sched.dayOfWeek]?.slice(0,3)}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                                        {sched.startTime} – {sched.endTime}
                                        <span className="ml-2 text-xs font-normal text-slate-400">{DAY_NAMES_SHORT[sched.dayOfWeek]}</span>
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                        {sched.room && <span className="flex items-center gap-1"><MapPin size={11} />{sched.room}</span>}
                                        {sched.note && <span>{sched.note}</span>}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { if(confirm('Hapus jadwal ini?')) startTransition(async () => { await deleteSchedule(sched.id, courseId); }); }}
                                className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors shrink-0"
                            >
                                <Trash size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============ TAB TUGAS ============
function TugasTab({ courseId, assignments, weekModules }: { courseId: string; assignments: any[]; weekModules: any[] }) {
    const [showForm, setShowForm] = useState(false);
    const [editAssignment, setEditAssignment] = useState<any>(null);
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        data.append('courseId', courseId);
        if (editAssignment) data.append('id', editAssignment.id);

        startTransition(async () => {
            setErr(''); setMsg('');
            const res = editAssignment ? await updateAssignment(null, data) : await createAssignment(null, data);
            if (res.error) setErr(res.error);
            else { setMsg(res.message || 'Berhasil!'); form.reset(); setShowForm(false); setEditAssignment(null); }
        });
    };

    const unassigned = assignments.filter(a => !a.weekModuleId);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{assignments.length} tugas aktif</p>
                <button onClick={() => { setShowForm(true); setEditAssignment(null); }} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-all">
                    <Plus size={16} /> Buat Tugas
                </button>
            </div>

            {msg && <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl border border-emerald-200">{msg}</div>}
            {err && <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200">{err}</div>}

            {showForm && (
                <div className="glass-panel rounded-2xl p-5 border border-amber-200 dark:border-amber-500/30">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{editAssignment ? 'Sunting Tugas' : 'Tugas Baru'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Judul Tugas</label>
                            <input name="title" defaultValue={editAssignment?.title} required placeholder="contoh: Latihan Soal Pemrograman Dasar" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                        </div>
                        {weekModules.length > 0 && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Modul Minggu (Opsional)</label>
                                <select name="weekModuleId" defaultValue={editAssignment?.weekModuleId || ''} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                                    <option value="">— Tanpa Modul —</option>
                                    {weekModules.map((wm: any) => (
                                        <option key={wm.id} value={wm.id}>Minggu {wm.weekNumber}: {wm.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Tenggat Waktu</label>
                                <input type="datetime-local" name="dueDate" defaultValue={editAssignment?.dueDate ? new Date(editAssignment.dueDate).toISOString().slice(0,16) : ''} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nilai Maksimum</label>
                                <input type="number" name="maxScore" defaultValue={editAssignment?.maxScore ?? 100} min={1} max={1000} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Deskripsi / Soal</label>
                            <textarea name="description" defaultValue={editAssignment?.description || ''} rows={5} placeholder="Tuliskan soal atau instruksi pengerjaan..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none" />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" disabled={isPending} className="px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
                                {isPending ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Simpan Tugas</>}
                            </button>
                            <button type="button" onClick={() => { setShowForm(false); setEditAssignment(null); }} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm">Batal</button>
                        </div>
                    </form>
                </div>
            )}

            {assignments.length === 0 && !showForm ? (
                <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                    <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Belum ada tugas. Buat tugas pertama untuk siswa Anda!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tugas tanpa modul */}
                    {unassigned.length > 0 && (
                        <div className="space-y-2">
                            {weekModules.length > 0 && <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanpa Modul</p>}
                            {unassigned.map(assignment => (
                                <AssignmentCard key={assignment.id} assignment={assignment} courseId={courseId}
                                    onEdit={() => { setEditAssignment(assignment); setShowForm(true); }}
                                    onDelete={() => { if(confirm(`Hapus tugas "${assignment.title}"?`)) startTransition(async() => { await deleteAssignment(assignment.id, courseId); }); }}
                                />
                            ))}
                        </div>
                    )}
                    {/* Per modul minggu */}
                    {weekModules.map((wm: any) => {
                        const wAssignments = assignments.filter(a => a.weekModuleId === wm.id);
                        return (
                            <div key={wm.id} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg accent-bg text-white text-xs font-bold flex items-center justify-center shrink-0">{wm.weekNumber}</span>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{wm.title}</p>
                                    <span className="text-xs text-slate-400">{wAssignments.length} tugas</span>
                                </div>
                                {wAssignments.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic pl-8">Belum ada tugas di modul ini.</p>
                                ) : (
                                    wAssignments.map(assignment => (
                                        <AssignmentCard key={assignment.id} assignment={assignment} courseId={courseId}
                                            onEdit={() => { setEditAssignment(assignment); setShowForm(true); }}
                                            onDelete={() => { if(confirm(`Hapus tugas "${assignment.title}"?`)) startTransition(async() => { await deleteAssignment(assignment.id, courseId); }); }}
                                        />
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function AssignmentCard({ assignment, courseId, onEdit, onDelete }: any) {
    const [expanded, setExpanded] = useState(false);
    const submitted = assignment.submissions?.length ?? 0;
    const graded = assignment.submissions?.filter((s: any) => s.score !== null).length ?? 0;
    const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

    return (
        <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">{assignment.title}</h3>
                            {assignment.dueDate && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${isOverdue ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                                    <Clock size={10} />
                                    {new Date(assignment.dueDate).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Nilai Maks: <strong className="text-slate-700 dark:text-slate-300">{assignment.maxScore}</strong></span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {submitted} dikumpulkan</span>
                            <span className="flex items-center gap-1"><Star size={12} /> {graded}/{submitted} dinilai</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={onEdit} className="w-7 h-7 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 flex items-center justify-center transition-colors"><Pencil size={14} /></button>
                        <button onClick={onDelete} className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors"><Trash size={14} /></button>
                        <button onClick={() => setExpanded(!expanded)} className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 dark:border-slate-700/50 p-5 space-y-4">
                    {assignment.description && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Soal / Deskripsi</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{assignment.description}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-3">Pengumpulan Siswa ({submitted})</p>
                        {assignment.submissions?.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">Belum ada siswa yang mengumpulkan.</p>
                        ) : (
                            <div className="space-y-3">
                                {assignment.submissions.map((sub: any) => (
                                    <SubmissionRow key={sub.id} submission={sub} maxScore={assignment.maxScore} courseId={courseId} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function SubmissionRow({ submission, maxScore, courseId }: { submission: any; maxScore: number; courseId: string }) {
    const [grading, setGrading] = useState(false);
    const [score, setScore] = useState(submission.score?.toString() ?? '');
    const [feedback, setFeedback] = useState(submission.feedback ?? '');
    const [isPending, startTransition] = useTransition();
    const [savedMsg, setSavedMsg] = useState('');

    const handleGrade = () => {
        startTransition(async () => {
            setSavedMsg('');
            const res = await gradeSubmission(submission.id, parseInt(score), feedback, courseId);
            if (res.error) setSavedMsg('❌ ' + res.error);
            else { setSavedMsg('✓ ' + res.message); setGrading(false); }
        });
    };

    return (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${submission.user.name}`} alt="" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{submission.user.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{submission.user.nim}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {submission.score !== null ? (
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                            {submission.score}/{maxScore}
                        </span>
                    ) : (
                        <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <AlertCircle size={12} /> Belum dinilai
                        </span>
                    )}
                    <button onClick={() => setGrading(!grading)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                        <Star size={12} /> Nilai
                    </button>
                </div>
            </div>

            {submission.content && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs font-bold text-slate-500 mb-1">Jawaban:</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-3">{submission.content}</p>
                </div>
            )}

            {grading && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 space-y-2">
                    <div className="flex gap-2">
                        <div className="w-28">
                            <label className="text-xs font-bold text-slate-500 block mb-1">Nilai (/{maxScore})</label>
                            <input type="number" value={score} onChange={e => setScore(e.target.value)} min={0} max={maxScore} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-500 block mb-1">Catatan/Feedback</label>
                            <input type="text" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Opsional..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    {savedMsg && <p className={`text-xs font-medium ${savedMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>{savedMsg}</p>}
                    <button onClick={handleGrade} disabled={!score || isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5">
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> Simpan Nilai</>}
                    </button>
                </div>
            )}
        </div>
    );
}

// ============ TAB PESERTA & NILAI ============
function PesertaTab({ courseId, enrollments, assignments }: { courseId: string; enrollments: any[]; assignments: any[] }) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500">{enrollments.length} siswa terdaftar</p>

            {enrollments.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Belum ada siswa yang terdaftar di kursus ini.</p>
                </div>
            ) : assignments.length === 0 ? (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="p-4">Siswa</th>
                                <th className="p-4">NIM</th>
                                <th className="p-4 text-center">Bergabung</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {enrollments.map((enrollment: any) => (
                                <tr key={enrollment.userId}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${enrollment.user.name}`} alt="" />
                                            </div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{enrollment.user.name}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500 font-mono">{enrollment.user.nim ?? '—'}</td>
                                    <td className="p-4 text-center text-xs text-slate-400">{new Date(enrollment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="p-4">Siswa</th>
                                    {assignments.map((a: any) => (
                                        <th key={a.id} className="p-4 text-center min-w-[90px]">
                                            <span className="block truncate max-w-[80px]" title={a.title}>{a.title.substring(0,12)}{a.title.length>12?'…':''}</span>
                                            <span className="text-slate-400 font-normal normal-case">/{a.maxScore}</span>
                                        </th>
                                    ))}
                                    <th className="p-4 text-center min-w-[80px]">Rata-rata</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {enrollments.map((enrollment: any) => {
                                    // Match by user.id (submission doesn't expose userId scalar directly)
                                    const scores = assignments.map((a: any) => {
                                        const sub = a.submissions?.find((s: any) => s.user?.id === enrollment.user.id);
                                        return sub ? { score: sub.score, maxScore: a.maxScore, submitted: true } : null;
                                    });
                                    const scoredItems = scores.filter((s: any) => s !== null && s.score !== null) as { score: number; maxScore: number }[];
                                    const avg = scoredItems.length > 0
                                        ? Math.round(scoredItems.reduce((acc, s) => acc + (s.score / s.maxScore) * 100, 0) / scoredItems.length)
                                        : null;

                                    return (
                                        <tr key={enrollment.user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${enrollment.user.name}`} alt="" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{enrollment.user.name}</p>
                                                        <p className="text-xs text-slate-400 font-mono">{enrollment.user.nim ?? '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {assignments.map((a: any) => {
                                                const sub = a.submissions?.find((s: any) => s.user?.id === enrollment.user.id);
                                                return (
                                                    <td key={a.id} className="p-4 text-center">
                                                        {sub?.score !== undefined && sub?.score !== null ? (
                                                            <span className={`font-bold text-sm ${
                                                                sub.score / a.maxScore >= 0.7
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : 'text-red-500 dark:text-red-400'
                                                            }`}>{sub.score}</span>
                                                        ) : sub ? (
                                                            <span className="text-amber-500 text-xs font-medium">Belum dinilai</span>
                                                        ) : (
                                                            <span className="text-slate-300 dark:text-slate-600 text-sm">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="p-4 text-center">
                                                {avg !== null ? (
                                                    <span className={`font-bold text-sm px-2 py-0.5 rounded-lg ${
                                                        avg >= 70
                                                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                                            : 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
                                                    }`}>{avg}%</span>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-600 text-sm">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
