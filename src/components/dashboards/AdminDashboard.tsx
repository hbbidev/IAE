"use client";

import StatCard from '@/components/StatCard';
import { Users, Server, ShieldCheck, Activity, Sparkles } from 'lucide-react';

export default function AdminDashboard({ name, totalUsers, totalCourses }: { name: string, totalUsers: number, totalCourses: number }) {
  return (
    <>
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-[0_20px_40px_-15px_rgba(15,23,42,0.5)] mb-8 hover-lift relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-2">
            Konsol Administrator <ShieldCheck className="text-blue-400" size={24} />
          </h1>
          <p className="text-slate-300 max-w-xl">Selamat datang, {name}. Sistem berjalan normal. Server dalam performa prima.</p>
        </div>
        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl animate-[float_5s_ease-in-out_infinite]"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Pengguna"
          value={totalUsers}
          subtitle="Murid, Guru & Admin"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Kursus"
          value={totalCourses}
          subtitle="Aktif di platform"
          icon={Server}
          color="purple"
        />
        <StatCard
          title="Server Uptime"
          value="99.9%"
          subtitle="Aman"
          icon={Activity}
          color="emerald"
        />
      </div>

       <div className="glass-panel rounded-3xl p-7 flex flex-col items-center justify-center py-16 hover-lift text-center">
            <Sparkles size={48} className="text-blue-500/50 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Pusat Kendali</h2>
            <p className="text-slate-500 max-w-sm">Gunakan Navigasi "Hak Akses" di bilah samping untuk memanajemen pengguna, atau "Manajemen Kursus" untuk mengatur modul.</p>
       </div>
    </>
  )
}
