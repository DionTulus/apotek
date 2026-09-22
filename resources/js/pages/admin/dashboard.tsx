import { Head } from '@inertiajs/react';

export default function AdminDashboard() {
    return (
        <>
            <Head title="Admin Dashboard - Apotek ERP" />
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard ERP Admin</h1>
                <p className="mt-2 text-gray-600">Selamat datang di Panel Kontrol Apotek ERP.</p>
            </div>
        </>
    );
}
