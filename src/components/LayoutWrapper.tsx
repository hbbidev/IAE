"use client";

import { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import RightSidebar from '@/components/RightSidebar';
import MobileLayout from '@/components/MobileLayout';

export default function LayoutWrapper({ children, isMobile }: { children: React.ReactNode; isMobile?: boolean }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved !== null) {
            setSidebarCollapsed(JSON.parse(saved));
        }
    }, []);

    const isAuthRoute = pathname === '/login' || pathname === '/register';

    if (isAuthRoute) {
        return (
            <div className="min-h-screen bg-[#F4F7FE] dark:bg-black transition-colors duration-300 flex flex-col">
                {children}
            </div>
        );
    }

    // Server-Side Detected Mobile Layout (Android/iOS, etc.)
    if (isMobile) {
        return (
            <MobileLayout>
                {children}
            </MobileLayout>
        );
    }

    // Default Desktop Layout
    return (
        <div className="min-h-screen bg-[#F4F7FE] dark:bg-black flex transition-colors duration-300 relative overflow-x-hidden">
            {/* Global Sidebar (Left) */}
            <Suspense fallback={null}>
                <Sidebar
                    mobileOpen={mobileMenuOpen}
                    setMobileOpen={setMobileMenuOpen}
                    collapsed={sidebarCollapsed}
                    setCollapsed={(val) => {
                        setSidebarCollapsed(val);
                        localStorage.setItem('sidebarCollapsed', JSON.stringify(val));
                    }}
                />
            </Suspense>

            {/* Main Content Area (Center) */}
            <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-[120px]' : 'lg:pl-[280px]'} ${rightSidebarOpen ? 'xl:pr-[344px]' : 'xl:pr-6'} min-h-screen flex flex-col px-6 py-6`}>
                {/* Global Header */}
                <Header 
                    onMenuClick={() => setMobileMenuOpen(true)} 
                    onNotificationClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                />

                {/* Page Content */}
                <div className="flex-1 pb-10">
                    {children}
                </div>
            </main>

            {/* Right Sidebar Mobile/Tablet Overlay */}
            {rightSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-35 xl:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setRightSidebarOpen(false)}
                />
            )}

            {/* Global Right Sidebar (Right) */}
            <RightSidebar open={rightSidebarOpen} setOpen={setRightSidebarOpen} />
        </div>
    );
}
