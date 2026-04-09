"use client";

import StatCard from '@/components/StatCard';
import { BookOpen, ClipboardList, GraduationCap, PlayCircle, Clock, MapPin, Sparkles } from 'lucide-react';

const activeCourses = [
  { id: 1, course: 'Database Engineering', progress: 75, nextLesson: 'Advanced Joins', time: '14:00 Today', color: 'blue' },
  { id: 2, course: 'Cloud Architecture', progress: 40, nextLesson: 'AWS Serverless', time: '10:00 Tomorrow', color: 'purple' },
  { id: 3, course: 'UI/UX Design Masterclass', progress: 90, nextLesson: 'Prototyping in Figma', time: '15:30 Tomorrow', color: 'emerald' },
];

const upcomingAssignments = [
  { id: 1, title: 'Database Normalization Project', course: 'Database Engineering', due: 'Tomorrow, 23:59', type: 'Project' },
  { id: 2, title: 'AWS Lambda Deploy', course: 'Cloud Architecture', due: 'In 3 days', type: 'Lab' },
  { id: 3, title: 'Usability Testing Report', course: 'UI/UX Design', due: 'Next Week', type: 'Report' },
];

export default function Home() {
  return (
    <>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 text-white shadow-[0_20px_40px_-15px_rgba(109,40,217,0.5)] mb-8 hover-lift relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-2">
            Welcome back, Student! <Sparkles className="text-yellow-300" size={24} />
          </h1>
          <p className="text-blue-100 max-w-xl">You have 2 upcoming assignments this week. Jump back into your courses to continue your learning streak.</p>
        </div>

        {/* Decorative background objects */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-48 h-48 bg-purple-400/30 rounded-full blur-2xl animate-[float_5s_ease-in-out_infinite]"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Avg. Grade"
          value="A-"
          subtitle="Top 15% in class"
          icon={GraduationCap}
          color="indigo"
          trend="up"
          trendValue="+0.2"
        />
        <StatCard
          title="Courses in Progress"
          value="3"
          subtitle="Out of 4 enrolled"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Assignments Due"
          value="2"
          subtitle="Within 7 days"
          icon={ClipboardList}
          color="amber"
          trend="neutral"
          trendValue="Urgent"
        />
        <StatCard
          title="Learning Hours"
          value="14.5"
          subtitle="This week"
          icon={Clock}
          color="blue"
          trend="up"
          trendValue="+2.5h"
        />
      </div>

      {/* Bottom Section: Active Courses & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Courses Card */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-7 flex flex-col hover-lift">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Jump Back In</h2>
            <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">View all courses</button>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {activeCourses.map((item) => (
              <div key={item.id} className="group flex items-center p-4 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer">
                <div className={`w-14 h-14 rounded-2xl bg-${item.color}-100 dark:bg-${item.color}-900/40 flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 mr-4 shadow-inner`}>
                  <PlayCircle size={28} className="group-hover:scale-110 transition-transform duration-300" />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{item.course}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Next: {item.nextLesson}</span>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{item.time}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                    <div className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignments Card */}
        <div className="glass-panel rounded-3xl p-7 flex flex-col hover-lift">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Upcoming Tasks</h2>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {upcomingAssignments.map((task) => (
              <div key={task.id} className="relative p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm cursor-pointer group">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-md">{task.course}</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">{task.due}</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{task.title}</h3>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <ClipboardList size={14} /> {task.type}
                </div>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            Open Assignments
          </button>
        </div>

      </div>
    </>
  );
}
