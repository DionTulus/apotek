import AdminLayout from '@/layouts/admin-layout';
import { Link, router, useForm } from '@inertiajs/react';
import {
    Edit3,
    Key,
    Mail,
    Phone,
    Plus,
    Search,
    Shield,
    Trash2,
    User,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface UserItem {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'pharmacist' | 'customer';
    created_at: string;
    orders_count: number;
}

interface Props {
    users: {
        data: UserItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    roles: { value: string; label: string }[];
    stats: {
        total: number;
        admin: number;
        pharmacist: number;
        customer: number;
    };
    filters: {
        role?: string;
        search?: string;
    };
}

export default function UsersIndex({ users, roles, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);

    const addForm = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'pharmacist',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'pharmacist',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/pengguna',
            { role: filters.role, search },
            { preserveState: true }
        );
    };

    const handleFilterRole = (roleVal: string) => {
        router.get(
            '/admin/pengguna',
            { role: roleVal, search },
            { preserveState: true }
        );
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/pengguna', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addForm.reset();
            },
        });
    };

    const openEditModal = (user: UserItem) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            phone: user.phone || '',
            role: user.role,
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        editForm.put(`/admin/pengguna/${editingUser.id}`, {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (user: UserItem) => {
        if (confirm(`Hapus pengguna ${user.name} (${user.email})?`)) {
            router.delete(`/admin/pengguna/${user.id}`);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'pharmacist':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'customer':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <AdminLayout title="Manajemen Pengguna & Hak Akses">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Pengguna & Hak Akses (RBAC)</h1>
                        <p className="text-xs text-slate-500">
                            Kelola staf apotek, apoteker penanggung jawab, administrator, dan akun pelanggan.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-3.5 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                        <Plus className="w-4 h-4" /> Tambah Staf Baru
                    </button>
                </div>

                {/* Role Filter KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div
                        onClick={() => handleFilterRole('')}
                        className={`p-4 rounded-xl border cursor-pointer transition shadow-xs ${
                            !filters.role
                                ? 'bg-blue-50 border-[#8CA9FF]'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-500">Semua Akun</span>
                        <p className="text-xl font-extrabold text-slate-800 mt-1">{stats.total}</p>
                    </div>

                    <div
                        onClick={() => handleFilterRole('admin')}
                        className={`p-4 rounded-xl border cursor-pointer transition shadow-xs ${
                            filters.role === 'admin'
                                ? 'bg-purple-50 border-purple-300'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-purple-600">Administrator</span>
                        <p className="text-xl font-extrabold text-purple-700 mt-1">{stats.admin}</p>
                    </div>

                    <div
                        onClick={() => handleFilterRole('pharmacist')}
                        className={`p-4 rounded-xl border cursor-pointer transition shadow-xs ${
                            filters.role === 'pharmacist'
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-blue-600">Apoteker</span>
                        <p className="text-xl font-extrabold text-blue-700 mt-1">{stats.pharmacist}</p>
                    </div>

                    <div
                        onClick={() => handleFilterRole('customer')}
                        className={`p-4 rounded-xl border cursor-pointer transition shadow-xs ${
                            filters.role === 'customer'
                                ? 'bg-slate-100 border-slate-300'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-600">Pelanggan</span>
                        <p className="text-xl font-extrabold text-slate-800 mt-1">{stats.customer}</p>
                    </div>
                </div>

                {/* Filter Search */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama pengguna, email, atau nomor telepon..."
                                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white text-xs font-bold rounded-lg transition"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Nama Pengguna</th>
                                    <th className="px-4 py-3">Email & Kontak</th>
                                    <th className="px-4 py-3">Peran (Role)</th>
                                    <th className="px-4 py-3">Total Pesanan</th>
                                    <th className="px-4 py-3">Bergabung</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#8CA9FF]/20 text-[#6587e6] font-bold flex items-center justify-center text-xs">
                                                        {user.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{user.name}</p>
                                                        <p className="text-[10px] text-slate-400">ID #{user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="text-slate-700 font-medium flex items-center gap-1.5">
                                                    <Mail className="w-3 h-3 text-slate-400" />
                                                    {user.email}
                                                </p>
                                                {user.phone && (
                                                    <p className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                                                        <Phone className="w-3 h-3 text-slate-400" />
                                                        {user.phone}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getRoleBadge(
                                                        user.role
                                                    )}`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-700 font-semibold">
                                                {user.orders_count} pesanan
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-500">
                                                {new Date(user.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3.5 text-right space-x-1.5">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition inline-block"
                                                    title="Edit User"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition inline-block"
                                                    title="Hapus User"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            Tidak ada pengguna ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links && users.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
                            <p className="text-slate-500">Total {users.total} Pengguna</p>
                            <div className="flex gap-1">
                                {users.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                            link.active
                                                ? 'bg-[#8CA9FF] text-white font-bold'
                                                : link.url
                                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                : 'text-slate-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Add User */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 text-[#6587e6]">
                                <Shield className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">Tambah Staf / Pengguna Baru</h3>
                            </div>
                            <form onSubmit={submitAdd} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={addForm.data.name}
                                        onChange={(e) => addForm.setData('name', e.target.value)}
                                        placeholder="Nama staf apotek"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={addForm.data.email}
                                        onChange={(e) => addForm.setData('email', e.target.value)}
                                        placeholder="email@erp-apotek.test"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={addForm.data.password}
                                        onChange={(e) => addForm.setData('password', e.target.value)}
                                        placeholder="Minimal 8 karakter"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WA</label>
                                    <input
                                        type="text"
                                        value={addForm.data.phone}
                                        onChange={(e) => addForm.setData('phone', e.target.value)}
                                        placeholder="081234567890"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Hak Akses (Role)</label>
                                    <select
                                        value={addForm.data.role}
                                        onChange={(e) => addForm.setData('role', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    >
                                        {roles.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label} ({r.value})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={addForm.processing}
                                        className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg transition font-bold"
                                    >
                                        {addForm.processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Edit User */}
                {editingUser && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 text-[#6587e6]">
                                <Edit3 className="w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-800">Edit Pengguna: {editingUser.name}</h3>
                            </div>
                            <form onSubmit={submitEdit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Password Baru (Kosongkan jika tidak diganti)
                                    </label>
                                    <input
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        placeholder="Biarkan kosong jika tidak diubah"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WA</label>
                                    <input
                                        type="text"
                                        value={editForm.data.phone}
                                        onChange={(e) => editForm.setData('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Hak Akses (Role)</label>
                                    <select
                                        value={editForm.data.role}
                                        onChange={(e) => editForm.setData('role', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#8CA9FF]"
                                    >
                                        {roles.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label} ({r.value})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="px-4 py-2 bg-[#8CA9FF] hover:bg-[#7292eb] text-white rounded-lg transition font-bold"
                                    >
                                        {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
