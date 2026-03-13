"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const isAuthRoute = pathname === '/login' || pathname === '/register';

    if (isAuthRoute) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300 flex flex-col">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black flex transition-colors duration-300">
            {/* Global Sidebar */}
            <Sidebar
                mobileOpen={mobileMenuOpen}
                setMobileOpen={setMobileMenuOpen}
            />

            {/* Main Content Area */}
            <main className="flex-1 transition-all duration-300 lg:pl-[6.5rem] xl:pl-[17.5rem] mx-4 lg:mr-6 my-6 flex flex-col min-h-[calc(100vh-3rem)]">
                {/* Global Header */}
                <Header onMenuClick={() => setMobileMenuOpen(true)} />

                {/* Page Content */}
                <div className="flex-1 pb-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
