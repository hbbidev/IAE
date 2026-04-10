"use client";

import React, { useState } from 'react';
import { Server, Search, Plus, X, Loader2, Pencil, Trash, FileText, Users } from 'lucide-react';
import { createCourse, updateCourse, deleteCourse } from '@/actions/course';
import CourseEnrollPanel from './CourseEnrollPanel';

export default function CourseManagementClient({ courses, teachers, students }: { courses: any[], teachers: any[], students: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [enrollPanelCourse, setEnrollPanelCourse] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCourses = courses.filter((c) => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl shadow-sm">
                        <Server size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manajemen Kursus Master</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Pusat kendali pembuatan kelas dan penugasan dosen/guru.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Cari kelas atau guru..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingCourse(null); setIsModalOpen(true); }}
                        className="h-11 px-4 flex items-center gap-2 accent-bg hover:opacity-90 text-white font-medium rounded-xl shadow-[0_8px_20px_hsl(var(--accent-h)_var(--accent-s)_var(--accent-l)_/_0.2)] hover:-translate-y-0.5 transition-all w-max"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">Tambah Kursus</span>
                    </button>
                </div>
            </div>

            {/* Course List */}
            <div className="flex-1 glass-panel rounded-3xl p-2 sm:p-4 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th className="p-4">Informasi Kursus</th>
                                <th className="p-4 hidden md:table-cell">Deskripsi Terpotong</th>
                                <th className="p-4">Dosen/Guru</th>
                                <th className="p-4 hidden sm:table-cell">Peserta</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 shrink-0 border border-purple-100 dark:border-purple-800/50 flex items-center justify-center">
                                           <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-slate-200 text-base">{course.title}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                ID: <span className="font-mono">{course.id.substring(0, 8)}...</span>
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-xs truncate">
                                        {course.description || <span className="italic text-slate-400">Tidak ada deskripsi</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                                 <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${course.teacher?.name}`} alt="Ava" />
                                            </div>
                                            {course.teacher?.name || "Guru Tidak Dikenal"}
                                        </div>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <button
                                            onClick={() => setEnrollPanelCourse(course)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400 transition-colors"
                                        >
                                            <Users size={14} />
                                            {course.enrollments?.length ?? 0} Peserta
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => { setEditingCourse(course); setIsModalOpen(true); }}
                                                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 flex items-center justify-center transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    if(confirm(`Yakin ingin menghapus kelas "${course.title}"? Seluruh pelajaran di dalamnya akan hilang.`)) {
                                                        const res = await deleteCourse(course.id);
                                                        if(res.error) alert(res.error);
                                                    }
                                                }}
                                                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">Belum ada kursus yang dibuat. Tekan tombol Tambah.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <CourseFormModal teachers={teachers} course={editingCourse} onClose={() => setIsModalOpen(false)} />
            )}
            {enrollPanelCourse && (
                <CourseEnrollPanel
                    courseId={enrollPanelCourse.id}
                    courseTitle={enrollPanelCourse.title}
                    enrollments={enrollPanelCourse.enrollments || []}
                    students={students}
                    onClose={() => setEnrollPanelCourse(null)}
                />
            )}
        </div>
    );
}

function CourseFormModal({ teachers, course, onClose }: { teachers: any[]; course?: any; onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.currentTarget);
        if (course) {
            formData.append('id', course.id);
        }

        const result = course ? await updateCourse(null, formData) : await createCourse(null, formData);
        
        if (result.error) {
            setError(result.error);
        } else if (result.success) {
            setSuccess(result.message || 'Berhasil disimpan!');
            setTimeout(() => onClose(), 1500);
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Server className="text-purple-500" /> {course ? 'Sunting Kursus' : 'Kursus Baru'}
                    </h2>
                    <button onClick={onClose} disabled={isLoading} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-full p-1.5 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <div className="p-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm font-medium rounded-xl border border-red-200">{error}</div>}
                    {success && <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-sm font-medium rounded-xl border border-emerald-200">{success}</div>}
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Judul Mata Kuliah / Kursus</label>
                        <input type="text" name="title" defaultValue={course?.title || ''} required placeholder="Contoh: Algoritma & Pemrograman Dasar" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Guru / Dosen Penanggung Jawab</label>
                        <select name="teacherId" defaultValue={course?.teacherId || ''} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-medium">
                            <option value="" disabled>-- Pilih Pengajar --</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Deskripsi Pengantar Singkat</label>
                        <textarea name="description" defaultValue={course?.description || ''} rows={3} placeholder="Tuliskan silabus singkat..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none" />
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full accent-bg text-white font-bold py-3.5 rounded-xl mt-6 flex justify-center items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-75 disabled:hover:translate-y-0">
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Simpan Data Kursus</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
