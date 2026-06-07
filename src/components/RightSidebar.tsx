"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { Bell, CheckSquare, ClipboardList, BookOpen, AlertCircle, Circle, X } from 'lucide-react';
import Link from 'next/link';

export default function RightSidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || 'STUDENT';
    const name = session?.user?.name || 'Siswa';

    // Mock activities depending on user role
    const getActivities = () => {
        if (role === 'ADMIN') {
            return [
                { text: "Server backup completed successfully.", time: "10 min ago", icon: BookOpen, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
                { text: "New teacher account 'Ibu Budi' registered.", time: "1 hour ago", icon: AlertCircle, color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" },
                { text: "Database migration 'add_location_columns' executed.", time: "4 hours ago", icon: CheckSquare, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
                { text: "System settings updated.", time: "Yesterday", icon: ClipboardList, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
            ];
        } else if (role === 'TEACHER') {
            return [
                { text: "Siswa Rajin submitted 'Tugas 1: Invers Matriks'.", time: "Just now", icon: ClipboardList, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
                { text: "Ani Wijaya completed 'Kuis 1: Logika Matematika'.", time: "30 min ago", icon: CheckSquare, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
                { text: "Today's attendance verified for Matematika Dasar.", time: "2 hours ago", icon: BookOpen, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" },
                { text: "You scheduled a new assignment due next Friday.", time: "Yesterday", icon: AlertCircle, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
            ];
        } else {
            return [
                { text: "Tugas 1 Matematika Dasar dinilai oleh Bapak Guru.", time: "5 min ago", icon: ClipboardList, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
                { text: "Bapak Guru memposting materi baru di Fisika Modern.", time: "1 hour ago", icon: BookOpen, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" },
                { text: "Presensi Hadir diverifikasi untuk Algoritma.", time: "3 hours ago", icon: CheckSquare, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
                { text: "Pengumuman SPP bulan Juni diterbitkan di AIS.", time: "Yesterday", icon: AlertCircle, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
            ];
        }
    };

    const contacts = [
        { name: "Siswa Rajin", status: "online", seed: "Siswa" },
        { name: "Budi Santoso", status: "online", seed: "Budi" },
        { name: "Ani Wijaya", status: "offline", seed: "Ani" },
        { name: "Siti Rahma", status: "online", seed: "Siti" },
        { name: "Ahmad Fauzi", status: "offline", seed: "Ahmad" },
        { name: "Bapak Guru", status: "online", seed: "Guru" }
    ];

    const notifications = [
        { title: "Kuis 1 Fisika Modern akan berakhir hari ini.", time: "30 menit lagi", route: "/courses" },
        { title: "Verifikasi email berhasil dilakukan.", time: "2 jam yang lalu", route: "/settings" }
    ];

    return (
        <aside className={`w-80 border-l border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-[#0F1524]/95 backdrop-blur-md fixed right-0 top-0 bottom-0 z-40 flex flex-col p-6 overflow-y-auto no-scrollbar gap-8 transition-transform duration-300 ease-in-out ${
            open ? 'translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.08)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'translate-x-full'
        }`}>
            {/* Header / Search Mock spacing & Close Button */}
            <div className="flex justify-between items-center h-10 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Informasi</span>
                <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                    title="Tutup Panel"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Notifications Section */}
            <div className="flex flex-col gap-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Notifikasi</h3>
                <div className="flex flex-col gap-3">
                    {notifications.map((notif, index) => (
                        <Link key={index} href={notif.route} className="flex flex-col p-3 rounded-2xl bg-[#E8EFFF]/40 dark:bg-slate-800/20 hover:bg-[#E8EFFF]/60 dark:hover:bg-slate-800/30 transition-all gap-1">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{notif.time}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Activities Section */}
            <div className="flex flex-col gap-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Aktivitas</h3>
                <div className="flex flex-col gap-4">
                    {getActivities().map((act, index) => (
                        <div key={index} className="flex gap-3 items-start group">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${act.color} group-hover:scale-105 transition-transform`}>
                                <act.icon size={15} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{act.text}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{act.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contacts Section */}
            <div className="flex flex-col gap-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Kontak Kelas</h3>
                <div className="flex flex-col gap-3">
                    {contacts.map((contact, index) => (
                        <div key={index} className="flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/10 p-2 rounded-xl transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                                    <img
                                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${contact.seed}`}
                                        alt={contact.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0b0f19] ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{contact.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
