"use client";

import { Settings, User, Bell, Shield, Paintbrush } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl shadow-sm">
                    <Settings size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Account Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your personal information and preferences.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings Navigation */}
                <div className="w-full lg:w-64 flex flex-col gap-2">
                    <button className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium rounded-xl shadow-sm text-left">
                        <User size={18} /> Profile Details
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium rounded-xl transition-colors text-left">
                        <Paintbrush size={18} /> Appearance
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium rounded-xl transition-colors text-left">
                        <Bell size={18} /> Notifications
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium rounded-xl transition-colors text-left">
                        <Shield size={18} /> Security & Privacy
                    </button>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 bg-white dark:bg-slate-800/30 rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] border border-slate-100/50 dark:border-slate-700/30">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">Profile Details</h2>

                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/40 overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-lg">
                                <img
                                    src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
                                    alt="User avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Change Avatar</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                                <input type="text" defaultValue="Budi Santoso" className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Student ID / NIM</label>
                                <input type="text" defaultValue="2301994820" className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" disabled />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address (Academic)</label>
                                <input type="email" defaultValue="budi.santoso@campus.ac.id" className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" disabled />
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                            <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all hover:-translate-y-0.5" disabled>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
