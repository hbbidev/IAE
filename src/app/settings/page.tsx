"use client";

import { useState, useActionState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Settings, User, Bell, Shield, Paintbrush, Check, AlertCircle, Eye, EyeOff, Moon, Sun, Monitor, Palette } from "lucide-react";
import { updateMyProfile } from "@/actions/user";
import { useTheme } from "next-themes";
import { useAccent, ACCENT_PRESETS } from "@/components/AccentProvider";
import MfaSection from "@/components/MfaSection";

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "profile" | "appearance" | "notifications" | "security";

// ─── Profile Tab ────────────────────────────────────────────────────────────

function ProfileTab({ name, email, nim }: { name: string; email: string; nim: string | null }) {
    const [state, formAction, isPending] = useActionState(updateMyProfile, null);

    return (
        <form action={formAction} className="space-y-6 max-w-2xl">
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full accent-bg flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white dark:ring-slate-800 shadow-lg select-none">
                    {name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nama */}
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Nama Lengkap
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        defaultValue={name}
                        required
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                    />
                </div>

                {/* NIM */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        NIM / ID Pengguna
                    </label>
                    <input
                        type="text"
                        value={nim ?? "—"}
                        readOnly
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400">NIM tidak bisa diubah.</p>
                </div>

                {/* Email */}
                <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Alamat Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400">Email diatur oleh administrator.</p>
                </div>
            </div>

            {/* Feedback */}
            {state?.error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    {state.error}
                </div>
            )}
            {state?.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-sm">
                    <Check size={16} className="shrink-0" />
                    {state.message}
                </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isPending ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Menyimpan...
                        </>
                    ) : (
                        "Simpan Perubahan"
                    )}
                </button>
            </div>
        </form>
    );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [state, formAction, isPending] = useActionState(updateMyProfile, null);

    return (
        <div className="space-y-8 max-w-xl">
        <form action={formAction} className="space-y-6">
            <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">Ganti Kata Sandi</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pastikan kata sandi baru minimal 6 karakter dan mudah diingat.
                </p>
            </div>

            {/* Hidden name field — required by action */}
            <input type="hidden" name="name" value="__keep__" />

            <div className="space-y-4">
                {/* Kata Sandi Saat Ini */}
                <div className="space-y-2">
                    <label htmlFor="currentPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Kata Sandi Saat Ini
                    </label>
                    <div className="relative">
                        <input
                            id="currentPassword"
                            name="currentPassword"
                            type={showCurrent ? "text" : "password"}
                            placeholder="••••••••"
                            className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Kata Sandi Baru */}
                <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Kata Sandi Baru
                    </label>
                    <div className="relative">
                        <input
                            id="newPassword"
                            name="newPassword"
                            type={showNew ? "text" : "password"}
                            placeholder="min. 6 karakter"
                            className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Konfirmasi */}
                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirm ? "text" : "password"}
                            placeholder="ulangi kata sandi baru"
                            className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Feedback */}
            {state?.error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    {state.error}
                </div>
            )}
            {state?.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-sm">
                    <Check size={16} className="shrink-0" />
                    Kata sandi berhasil diubah!
                </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center gap-2"
                >
                    {isPending ? "Menyimpan..." : "Ganti Kata Sandi"}
                </button>
            </div>
        </form>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-700" />

        {/* MFA Authenticator */}
        <MfaSection />
        </div>
    );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────

function AppearanceTab() {
    const { theme, setTheme } = useTheme();
    const { preset, customHex, setPreset, setCustomHex } = useAccent();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const themes = [
        { value: "light", label: "Terang", icon: Sun },
        { value: "dark", label: "Gelap", icon: Moon },
        { value: "system", label: "Sistem", icon: Monitor },
    ];

    const mainPresets = ACCENT_PRESETS.slice(0, 11);

    return (
        <div className="space-y-8 max-w-xl">
            {/* Theme */}
            <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">Tema Tampilan</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Pilih tema yang nyaman untuk Anda.
                </p>
                <div className="grid grid-cols-3 gap-4">
                    {themes.map(({ value, label, icon: Icon }) => {
                        const isActive = mounted && theme === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setTheme(value)}
                                style={isActive ? {
                                    borderColor: `hsl(var(--accent-h), var(--accent-s), var(--accent-l))`,
                                    backgroundColor: `hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.12)`,
                                } : {}}
                                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                                    isActive
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                                }`}
                            >
                                <Icon size={24} />
                                <span className="text-sm font-medium">{label}</span>
                                {isActive && <Check size={14} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700" />

            {/* Accent Color */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Palette size={16} className="text-slate-500" />
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Warna Aksen</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Warna ini akan mewarnai tombol, link, dan elemen aktif di seluruh aplikasi.
                </p>

                {/* Preview badge */}
                <div className="mb-5 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium uppercase tracking-wide">Preview</p>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-xl text-white text-sm font-medium transition-all hover:-translate-y-0.5"
                            style={{ backgroundColor: `hsl(var(--accent-h), var(--accent-s), var(--accent-l))` }}
                        >
                            Tombol Utama
                        </button>
                        <span
                            className="text-sm font-medium"
                            style={{ color: `hsl(var(--accent-h), var(--accent-s), var(--accent-l))` }}
                        >
                            Link Aktif
                        </span>
                        <span
                            className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{
                                backgroundColor: `hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.15)`,
                                color: `hsl(var(--accent-h), var(--accent-s), var(--accent-l))`,
                            }}
                        >
                            Badge Kelas
                        </span>
                        <span
                            className="inline-block w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(var(--accent-h), var(--accent-s), var(--accent-l))` }}
                        />
                    </div>
                </div>

                {/* Preset swatches */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                    {mainPresets.map((p) => {
                        const isActive = mounted && preset.name === p.name && preset.name !== "Custom";
                        return (
                            <button
                                key={p.name}
                                type="button"
                                onClick={() => setPreset(p)}
                                title={p.name}
                                className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                                    isActive
                                        ? "bg-slate-100 dark:bg-slate-800"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                                style={isActive ? { outline: `2px solid ${p.hex}`, outlineOffset: "1px" } : {}}
                            >
                                <span
                                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: p.hex }}
                                >
                                    {isActive && <Check size={14} color="white" />}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate w-full text-center">
                                    {p.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Custom color picker */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="relative">
                        <input
                            type="color"
                            value={customHex}
                            onChange={(e) => setCustomHex(e.target.value)}
                            className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white dark:border-slate-700 shadow-md p-0.5 bg-transparent"
                            title="Pilih warna kustom"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Warna Kustom</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Pilih warna bebas untuk aksen aplikasi</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-lg">
                        {customHex.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
    const [settings, setSettings] = useState({
        emailAssignment: true,
        emailQuiz: true,
        emailAnnouncement: false,
        pushAll: true,
    });

    const toggle = (key: keyof typeof settings) =>
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

    const items = [
        { key: "emailAssignment" as const, label: "Email — Tugas Baru", desc: "Notifikasi saat guru menambahkan tugas baru" },
        { key: "emailQuiz" as const, label: "Email — Quiz", desc: "Pengingat deadline quiz yang hampir tiba" },
        { key: "emailAnnouncement" as const, label: "Email — Pengumuman", desc: "Pengumuman dari administrator" },
        { key: "pushAll" as const, label: "Notifikasi Push", desc: "Semua notifikasi dalam aplikasi" },
    ];

    return (
        <div className="space-y-6 max-w-xl">
            <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">Preferensi Notifikasi</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Atur notifikasi mana yang ingin Anda terima.
                </p>
            </div>

            <div className="space-y-3">
                {items.map(({ key, label, desc }) => (
                    <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50"
                    >
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => toggle(key)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${settings[key] ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-600"}`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key] ? "translate-x-5" : "translate-x-0"}`}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profil", icon: User },
    { id: "appearance", label: "Tampilan", icon: Paintbrush },
    { id: "notifications", label: "Notifikasi", icon: Bell },
    { id: "security", label: "Keamanan", icon: Shield },
];

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const user = session?.user as any;

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl shadow-sm">
                    <Settings size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pengaturan Akun</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Kelola informasi pribadi dan preferensi Anda.
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Tab Navigation */}
                <div className="w-full lg:w-56 flex flex-col gap-1 shrink-0">
                    {TABS.map(({ id, label, icon: Icon }) => {
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl text-left transition-all ${
                                    isActive
                                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                                }`}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-slate-800/30 rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)] border border-slate-100/50 dark:border-slate-700/30">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                        {TABS.find((t) => t.id === activeTab)?.label}
                    </h2>

                    {activeTab === "profile" && (
                        <ProfileTab
                            name={user?.name ?? ""}
                            email={user?.email ?? ""}
                            nim={user?.nim ?? null}
                        />
                    )}
                    {activeTab === "appearance" && <AppearanceTab />}
                    {activeTab === "notifications" && <NotificationsTab />}
                    {activeTab === "security" && <SecurityTab />}
                </div>
            </div>
        </div>
    );
}
