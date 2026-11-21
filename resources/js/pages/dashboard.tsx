import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, ClipboardList, Package, Store } from 'lucide-react';

const destinations = [
    {
        title: 'Toko Apotek',
        description: 'Jelajahi katalog obat dan kebutuhan kesehatan.',
        href: '/',
        icon: Store,
    },
    {
        title: 'Katalog Produk',
        description: 'Cari produk kesehatan yang Anda butuhkan.',
        href: '/produk',
        icon: Package,
    },
    {
        title: 'Lacak Pesanan',
        description: 'Periksa perkembangan pengiriman pesanan.',
        href: '/lacak-pesanan',
        icon: ClipboardList,
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Beranda Akun" />
            <main className="min-h-full bg-slate-50 p-5 sm:p-8">
                <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 p-7 text-white shadow-lg sm:p-10">
                    <p className="text-sm font-semibold tracking-wide text-emerald-200">
                        KLINIK PREMISYS MEDIKA
                    </p>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        Selamat datang
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80 sm:text-base">
                        Akses layanan apotek, temukan produk, dan pantau pesanan
                        Anda dengan mudah.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-lg font-bold text-slate-900">
                        Akses cepat
                    </h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {destinations.map((destination) => {
                            const Icon = destination.icon;

                            return (
                                <Link
                                    key={destination.title}
                                    href={destination.href}
                                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-emerald-700" />
                                    </div>
                                    <h3 className="mt-5 font-semibold text-slate-900">
                                        {destination.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        {destination.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </main>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Beranda Akun', href: '/' }],
};
