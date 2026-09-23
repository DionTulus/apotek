import StoreLayout from '@/layouts/store-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Edit, MapPin, Plus, Star, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

interface AddressItem {
    id: number;
    label: string;
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
    address_line: string;
    is_default: boolean;
}

interface AddressesProps {
    addresses: AddressItem[];
}

export default function Addresses({ addresses = [] }: AddressesProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        label: '',
        recipient_name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        postal_code: '',
        address_line: '',
        is_default: false,
    });

    const openAddModal = () => {
        setEditingAddress(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (addr: AddressItem) => {
        setEditingAddress(addr);
        setData({
            label: addr.label,
            recipient_name: addr.recipient_name,
            phone: addr.phone,
            province: addr.province,
            city: addr.city,
            district: addr.district,
            postal_code: addr.postal_code,
            address_line: addr.address_line,
            is_default: addr.is_default,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAddress) {
            put(`/alamat/${editingAddress.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/alamat', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleSetDefault = (id: number) => {
        router.post(`/alamat/${id}/default`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
            router.delete(`/alamat/${id}`, { preserveScroll: true });
        }
    };

    return (
        <StoreLayout>
            <Head title="Alamat Pengiriman Saya" />

            <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#8CA9FF]/20 border border-[#8CA9FF]/30 text-[#8CA9FF] flex items-center justify-center">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Alamat Pengiriman</h1>
                            <p className="text-xs sm:text-sm text-slate-400">Kelola daftar alamat tujuan pengiriman pesanan Anda.</p>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2.5 rounded-full bg-[#8CA9FF] hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                        <Plus className="w-4 h-4" /> Tambah Alamat Baru
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {addresses.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#8CA9FF] flex items-center justify-center mx-auto">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Belum Ada Alamat Tersimpan</h3>
                        <p className="text-xs text-slate-500">
                            Tambahkan alamat tempat tinggal Anda untuk mempermudah proses checkout.
                        </p>
                        <button
                            onClick={openAddModal}
                            className="px-6 py-3 rounded-full bg-[#8CA9FF] text-white text-xs font-bold hover:bg-blue-500 transition shadow"
                        >
                            + Tambah Alamat Pertama
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className={`bg-white rounded-2xl border p-6 transition flex flex-col justify-between relative ${
                                    addr.is_default ? 'border-[#8CA9FF] shadow-md' : 'border-slate-200'
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
                                                {addr.label}
                                            </span>
                                            {addr.is_default && (
                                                <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-extrabold flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-blue-600" /> Utama
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-extrabold text-slate-900 text-sm">{addr.recipient_name}</h4>
                                        <p className="text-xs text-slate-500 font-semibold">{addr.phone}</p>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {addr.address_line}, {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                                    {!addr.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(addr.id)}
                                            className="text-xs font-bold text-[#8CA9FF] hover:text-blue-700 transition"
                                        >
                                            Jadikan Utamakan
                                        </button>
                                    )}

                                    <div className="flex items-center gap-3 ml-auto">
                                        <button
                                            onClick={() => openEditModal(addr)}
                                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Address Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="font-extrabold text-base text-slate-900">
                                {editingAddress ? 'Edit Alamat Pengiriman' : 'Tambah Alamat Pengiriman'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Label Alamat (misal: Rumah, Kantor)</label>
                                <input
                                    type="text"
                                    placeholder="Rumah"
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                                />
                                {errors.label && <p className="text-rose-500 text-[11px] mt-1">{errors.label}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Nama Penerima</label>
                                    <input
                                        type="text"
                                        placeholder="Budi Santoso"
                                        value={data.recipient_name}
                                        onChange={(e) => setData('recipient_name', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                                    />
                                    {errors.recipient_name && <p className="text-rose-500 text-[11px] mt-1">{errors.recipient_name}</p>}
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Nomor Telepon</label>
                                    <input
                                        type="text"
                                        placeholder="08123456789"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                                    />
                                    {errors.phone && <p className="text-rose-500 text-[11px] mt-1">{errors.phone}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Provinsi</label>
                                    <input
                                        type="text"
                                        placeholder="Jawa Barat"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                                    />
                                    {errors.province && <p className="text-rose-500 text-[11px] mt-1">{errors.province}</p>}
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
                                    <input
                                        type="text"
                                        placeholder="Bandung"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                                    />
                                    {errors.city && <p className="text-rose-500 text-[11px] mt-1">{errors.city}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Kecamatan</label>
                                    <input
                                        type="text"
                                        placeholder="Coblong"
                                        value={data.district}
                                        onChange={(e) => setData('district', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                                    />
                                    {errors.district && <p className="text-rose-500 text-[11px] mt-1">{errors.district}</p>}
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Kode Pos</label>
                                    <input
                                        type="text"
                                        placeholder="40132"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                                    />
                                    {errors.postal_code && <p className="text-rose-500 text-[11px] mt-1">{errors.postal_code}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap (Jalan, No. Rumah, RT/RW)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Jl. Dago No. 123, RT 01 / RW 05"
                                    value={data.address_line}
                                    onChange={(e) => setData('address_line', e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                                />
                                {errors.address_line && <p className="text-rose-500 text-[11px] mt-1">{errors.address_line}</p>}
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_default}
                                        onChange={(e) => setData('is_default', e.target.checked)}
                                        className="rounded border-slate-300 text-[#8CA9FF]"
                                    />
                                    <span className="font-bold text-slate-700">Jadikan Alamat Utama</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl bg-[#8CA9FF] hover:bg-blue-500 text-white font-extrabold shadow"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Alamat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </StoreLayout>
    );
}
