"use client";

import StatCard from '@/components/StatCard';
import { Award, BookOpen, CreditCard, Layers, Clock, MapPin } from 'lucide-react';

const scheduleData = [
  { id: 1, course: 'Data Structures & Algorithms', time: '08:00 - 10:30', room: 'Lab 01 - Compute', color: 'blue' },
  { id: 2, course: 'Web Development Frameworks', time: '11:00 - 13:30', room: 'Room 304 - Gedung A', color: 'indigo' },
  { id: 3, course: 'Database Management Systems', time: '14:30 - 16:00', room: 'Lab 03 - Compute', color: 'emerald' },
];

const announcements = [
  { id: 1, title: 'KRS Registration for Odd Semester 2026', date: 'Mar 10, 2026', type: 'Academic' },
  { id: 2, title: 'Tuition Payment Deadline Overview', date: 'Mar 15, 2026', type: 'Finance' },
  { id: 3, title: 'Campus Tech Seminar Series: AI in 2026', date: 'Mar 20, 2026', type: 'Event' },
];

export default function Home() {
  return (
    <>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700/80 dark:to-indigo-800/80 rounded-3xl p-8 text-white shadow-[0_15px_40px_rgba(79,70,229,0.3)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] mb-8 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden ring-1 ring-white/10 dark:ring-white/5">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, Budi! 👋</h1>
          <p className="text-blue-100 dark:text-blue-200/80 max-w-xl">You have 3 classes today. Don't forget that your mid-term exams start next week. Keep up the great work!</p>
        </div>

        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 dark:bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-48 h-48 bg-indigo-400/20 dark:bg-indigo-300/10 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Cumulative GPA"
          value="3.86"
          subtitle="Top 5% in your cohort"
          icon={Award}
          color="indigo"
          trend="up"
          trendValue="+0.12"
        />
        <StatCard
          title="Total Credits"
          value="84"
          subtitle="Out of 144 required"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Enrolled Credits"
          value="21"
          subtitle="Current semester"
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          title="Payment Status"
          value="Clear"
          subtitle="No pending invoices"
          icon={CreditCard}
          color="amber"
          trend="neutral"
          trendValue="Paid"
        />
      </div>

      {/* Bottom Section: Schedule & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Schedule Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/30 rounded-3xl p-7 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_15px_45px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col border border-slate-100/50 dark:border-slate-700/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Today's Schedule</h2>
            <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">View full calendar</button>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {scheduleData.map((item) => (
              <div key={item.id} className="group flex items-start p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all duration-300">
                <div className="w-14 items-center flex flex-col pt-1">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.time.split(' - ')[0]}</span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{item.time.split(' - ')[1]}</span>
                </div>

                <div className="w-1 h-12 bg-slate-200 dark:bg-slate-700 rounded-full mx-4 group-hover:bg-blue-400 dark:group-hover:bg-blue-500 transition-colors"></div>

                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg mb-1">{item.course}</h3>
                  <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm gap-4">
                    <span className="flex items-center gap-1.5"><Clock size={16} /> 2.5 Hrs</span>
                    <span className="flex items-center gap-1.5"><MapPin size={16} /> {item.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements Card */}
        <div className="bg-white dark:bg-slate-800/30 rounded-3xl p-7 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_15px_45px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col border border-slate-100/50 dark:border-slate-700/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Campus News</h2>
          </div>

          <div className="flex flex-col gap-5 flex-1">
            {announcements.map((news) => (
              <div key={news.id} className="relative pl-6 pb-2 last:pb-0">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 ring-4 ring-blue-50 dark:ring-blue-900/30"></div>
                <div className="mb-1 flex items-center gap-2 text-xs">
                  <span className="font-medium text-blue-600 dark:text-blue-400">{news.type}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-slate-500 dark:text-slate-400">{news.date}</span>
                </div>
                <h3 className="font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors leading-snug">{news.title}</h3>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300 border border-transparent dark:border-slate-700/50">
            View All Announcements
          </button>
        </div>

      </div>
    </>
  );
}
