"use client";

import { Wallet, Receipt } from "lucide-react";

export default function FinancePage() {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm">
                        <Wallet size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Finance & Tuition</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your billing and payment history.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800/30 rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] border border-slate-100/50 dark:border-slate-700/30 min-h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-emerald-500 dark:text-slate-400 shadow-[inset_0px_2px_10px_rgba(0,0,0,0.05)] border border-emerald-100 dark:border-slate-600">
                        <Receipt size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">You're All Caught Up</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">There are no pending invoices or outstanding tuition balances for your account at this time.</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700/30 dark:to-slate-800/30 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20 flex flex-col justify-between">
                    <div>
                        <p className="text-slate-400 text-sm mb-1 font-medium">Current Balance</p>
                        <h3 className="text-4xl font-bold mb-6">Rp 0</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-3">
                                <span className="text-slate-400">Next Billing</span>
                                <span className="font-medium text-slate-200">Odd Sem 2026</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-3">
                                <span className="text-slate-400">Payment Status</span>
                                <span className="text-emerald-400 font-semibold">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-700/50">
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors backdrop-blur-sm">
                            View Payment History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
