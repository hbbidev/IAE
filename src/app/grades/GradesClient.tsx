"use client";

import { GraduationCap, Download, FileText } from "lucide-react";
import StatCard from "@/components/StatCard";

interface GradeItem {
    code: string;
    title: string;
    jp: number;
    score: number | null;
    grade: string;
    status: string;
}

interface GradesClientProps {
    averageScore: string;
    totalJp: number;
    subjectCount: number;
    predicate: string;
    gradesList: GradeItem[];
}

export default function GradesClient({ averageScore, totalJp, subjectCount, predicate, gradesList }: GradesClientProps) {
    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 print:p-8">
            {/* Header (ByeWind minimalist styling) */}
            <div className="flex items-center justify-between mb-6 print:hidden">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#F3E8FF] dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-2xl">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Laporan Hasil Belajar (Rapor)</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Laporan hasil belajar siswa semester berjalan.</p>
                    </div>
                </div>

                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-[1.02]"
                >
                    <Download size={14} />
                    <span>Unduh Rapor</span>
                </button>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block mb-8 border-b pb-6">
                <h1 className="text-2xl font-bold text-slate-800 text-center">LAPORAN HASIL BELAJAR (RAPOR)</h1>
                <p className="text-slate-500 text-sm text-center mt-1">Sekolah Cikini LMS & Tuition Payment Platform</p>
                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                    <div>
                        <p><span className="font-semibold text-slate-500">Rata-rata Nilai:</span> {averageScore}</p>
                        <p><span className="font-semibold text-slate-500">Total Jam Pelajaran (JP):</span> {totalJp}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-semibold text-slate-500">Mata Pelajaran:</span> {subjectCount} Kelas</p>
                        <p><span className="font-semibold text-slate-500">Predikat Prestasi:</span> {predicate}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:hidden">
                <StatCard title="Rata-rata Nilai" value={averageScore} color="purple" trend={Number(averageScore) > 0 ? "up" : "neutral"} trendValue={Number(averageScore) > 0 ? "+0.0" : "0.0%"} />
                <StatCard title="Total JP" value={`${totalJp} JP`} color="blue" trend="neutral" trendValue="0.0%" />
                <StatCard title="Mata Pelajaran" value={`${subjectCount} Pelajaran`} color="indigo" trend="neutral" trendValue="0.0%" />
                <StatCard title="Predikat" value={predicate} color="emerald" trend="neutral" trendValue="0.0%" />
            </div>

            {/* Grades Table */}
            <div className="glass-panel rounded-2xl overflow-hidden p-6 print:border-0 print:shadow-none print:p-0">
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Daftar Nilai Akademik</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEMESTER GENAP 2025/2026</span>
                </div>
                <div className="overflow-x-auto">
                    {gradesList.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            <FileText size={40} className="mx-auto mb-3 opacity-30" />
                            <p>Anda belum terdaftar dalam mata pelajaran apa pun pada semester ini.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                                    <th className="pb-3 font-semibold">Kode</th>
                                    <th className="pb-3 font-semibold">Mata Pelajaran</th>
                                    <th className="pb-3 font-semibold text-center">JP</th>
                                    <th className="pb-3 font-semibold text-center">Nilai Angka</th>
                                    <th className="pb-3 font-semibold text-center">Nilai Huruf</th>
                                    <th className="pb-3 font-semibold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                {gradesList.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                        <td className="py-3.5 font-semibold text-slate-400 dark:text-slate-500 font-mono">{row.code}</td>
                                        <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">{row.title}</td>
                                        <td className="py-3.5 text-center font-semibold">{row.jp}</td>
                                        <td className="py-3.5 text-center font-semibold">{row.score !== null ? row.score : "—"}</td>
                                        <td className="py-3.5 text-center">
                                            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                                row.grade !== "—" 
                                                    ? "bg-[#E0F2FE] dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" 
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                            }`}>
                                                {row.grade}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-center">
                                            <span className={`font-bold text-[9px] uppercase px-2.5 py-0.5 rounded-full ${
                                                row.status === "LULUS" 
                                                    ? "bg-[#DCFCE7] dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" 
                                                    : row.status === "BELUM DINILAI"
                                                    ? "bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
                                                    : "bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400"
                                            }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
