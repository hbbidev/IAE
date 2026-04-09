"use client";

import React, { useState } from 'react';
import { Users, Search, Plus, X, Loader2, ShieldCheck, UserCircle, GraduationCap, Pencil, Trash } from 'lucide-react';
import { createUser, updateUser, deleteUser } from '@/actions/user';

export default function UserManagementClient({ users }: { users: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter((u) => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nim.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manajemen Akses</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola pengguna, guru, dan hak akses Administrator.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Cari ID atau Nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                        className="h-11 px-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all w-max"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">Tambah Pengguna</span>
                    </button>
                </div>
            </div>

            {/* User List */}
            <div className="flex-1 glass-panel rounded-3xl p-2 sm:p-4 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th className="p-4">Pengguna</th>
                                <th className="p-4 hidden sm:table-cell">ID / NIM</th>
                                <th className="p-4 hidden md:table-cell">Email</th>
                                <th className="p-4">Peran</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                                            <p className="text-xs text-slate-500 sm:hidden">{user.nim}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                                        {user.nim}
                                    </td>
                                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                                        {user.email || '-'}
                                    </td>
                                    <td className="p-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                                            ${user.role === 'ADMIN' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : ''}
                                            ${user.role === 'TEACHER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : ''}
                                            ${user.role === 'STUDENT' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : ''}
                                        `}>
                                            {user.role === 'ADMIN' && <ShieldCheck size={14} />}
                                            {user.role === 'TEACHER' && <UserCircle size={14} />}
                                            {user.role === 'STUDENT' && <GraduationCap size={14} />}
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                                                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center justify-center transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    if(confirm(`Yakin ingin menghapus ${user.name}?`)) {
                                                        const res = await deleteUser(user.id);
                                                        if(res.error) alert(res.error);
                                                    }
                                                }}
                                                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">Tidak ada pengguna yang cocok.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah/Edit Pengguna */}
            {isModalOpen && (
                <UserFormModal user={editingUser} onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}

function UserFormModal({ user, onClose }: { user?: any; onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.currentTarget);
        if (user) {
            formData.append('id', user.id);
        }

        const result = user ? await updateUser(null, formData) : await createUser(null, formData);
        
        if (result.error) {
            setError(result.error);
        } else if (result.success) {
            setSuccess(result.message || 'Berhasil disimpan!');
            setTimeout(() => onClose(), 1500);
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Users className="text-blue-500" /> {user ? 'Sunting Pengguna' : 'Pengguna Baru'}
                    </h2>
                    <button onClick={onClose} disabled={isLoading} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-full p-1.5 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm font-medium rounded-xl border border-red-200 dark:border-red-500/20">{error}</div>}
                    {success && <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-sm font-medium rounded-xl border border-emerald-200 dark:border-emerald-500/20">{success}</div>}
                    
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Nama Lengkap</label>
                        <input type="text" name="name" defaultValue={user?.name || ''} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Peran</label>
                            <select name="role" defaultValue={user?.role || 'STUDENT'} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium">
                                <option value="STUDENT">Siswa (STUDENT)</option>
                                <option value="TEACHER">Guru (TEACHER)</option>
                                <option value="ADMIN">Admin (ADMIN)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">ID / NIM / NIP</label>
                            <input type="text" name="nim" required defaultValue={user?.nim || ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Email (Opsional)</label>
                        <input type="email" name="email" defaultValue={user?.email || ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">{user ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi Default'}</label>
                        <input type="password" name="password" required={!user} defaultValue={user ? '' : 'password'} placeholder={user ? 'Kosongkan jika tidak berubah' : ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-mono" />
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl mt-4 flex justify-center items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-75 disabled:hover:translate-y-0">
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Simpan Pengguna</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
