"use client";

import React, { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import Link from 'next/link';
import { BookOpen, Users, ClipboardList, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';

export default function TeacherDashboard({ name, courses }: { name: string, courses: any[] }) {
  const [data, setData] = useState({
      courses,
      totalClasses: courses.length,
      totalStudents: courses.reduce((acc, curr) => acc + curr._count.enrollments, 0),
      pendingGrading: 0
  });

  useEffect(() => {
      const fetchUpdates = async () => {
          try {
              const res = await fetch('/api/dashboard');
              if (res.ok) {
                  const latest = await res.json();
                  if (latest.role === 'TEACHER') {
                      setData({
                          courses: latest.courses,
                          totalClasses: latest.totalClasses,
                          totalStudents: latest.totalStudents,
                          pendingGrading: latest.pendingGrading,
                      });
                  }
              }
          } catch (err) {
              console.error("Error polling teacher dashboard:", err);
          }
      };

      const interval = setInterval(fetchUpdates, 5000);
      fetchUpdates();
      return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="accent-bg rounded-3xl p-8 text-white shadow-[0_20px_40px_-15px_hsl(var(--accent-h)_var(--accent-s)_var(--accent-l)_/_0.4)] mb-8 hover-lift relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-2">
            Selamat Datang, Bapak/Ibu {name}! <Sparkles className="text-yellow-300" size={24} />
          </h1>
          <p className="text-white/80 max-w-xl">Anda memiliki {data.totalClasses} kelas aktif. Periksa modul pengajaran Anda minggu ini.</p>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Kelas"
          value={data.totalClasses}
          color="blue"
          trend="up"
          trendValue="+5.0%"
        />
        <StatCard
          title="Total Murid Diajar"
          value={data.totalStudents}
          color="purple"
          trend="up"
          trendValue="+12.0%"
        />
        <StatCard
          title="Tugas Menunggu Dinilai"
          value={data.pendingGrading}
          color="amber"
          trend="neutral"
          trendValue="0%"
        />
      </div>

      <div className="glass-panel rounded-3xl p-7 flex flex-col hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Manajemen Kursus Anda</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.courses.length > 0 ? data.courses.map((course) => (
             <div key={course.id} className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex justify-between items-center shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{course.title}</h3>
                  <p className="text-sm text-slate-500">{course._count.enrollments} murid terdaftar</p>
                </div>
              <Link href={`/teacher/courses/${course.id}`} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors">
                  <ChevronRight size={18} />
              </Link>
             </div>
          )) : (
            <p className="text-slate-500 italic">Anda belum memiliki kelas yang diajar.</p>
          )}
        </div>
      </div>
    </>
  )
}
