import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    HeartPulse,
    PackageCheck,
    ShieldCheck,
} from 'lucide-react';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';

type Props = {
    auth: {
        user?: {
            name: string;
        } | null;
    };
};

export default function Welcome() {
    const { auth } = usePage<Props>().props;

    return (
        <>
            <Head title="Klinik Premysis Medika" />
            <main className="min-h-screen overflow-hidden bg-[#f7faf7] text-slate-800">
                <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src="/logo_klinik2.png"
                            alt=""
                            className="h-12 w-10 object-contain"
                        />
                        <span className="text-sm leading-tight font-bold text-emerald-950">
                            Klinik Premysis
                            <br />
                            Medika
                        </span>
                    </Link>
                    <nav className="flex items-center gap-3">
                        <Link
                            href="/produk"
                            className="hidden text-sm font-semibold text-slate-600 transition hover:text-emerald-800 sm:inline"
                        >
                            Produk
                        </Link>
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900"
                            >
                                Akun Saya
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="text-sm font-semibold text-slate-600 transition hover:text-emerald-800"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900"
                                >
                                    Daftar
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
                    <div className="absolute -top-20 right-0 -z-0 h-80 w-80 rounded-full bg-lime-200/50 blur-3xl" />
                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm">
                            <HeartPulse className="h-4 w-4" />
                            Sahabat kesehatan keluarga
                        </span>
                        <h1 className="mt-7 max-w-2xl text-4xl leading-tight font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                            Layanan apotek yang dekat dan terpercaya.
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                            Temukan kebutuhan kesehatan Anda, pesan dengan
                            mudah, dan pantau pesanan dalam satu tempat.
                        </p>
                        <div className="mt-9 flex flex-wrap gap-3">
                            <Link
                                href="/produk"
                                className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-900"
                            >
                                Jelajahi Produk
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/lacak-pesanan"
                                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-800"
                            >
                                Lacak Pesanan
                            </Link>
                        </div>
                        <div className="mt-12 grid max-w-xl gap-4 sm:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                                <p className="text-sm leading-6 text-slate-600">
                                    Informasi produk dan layanan yang jelas.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                                <p className="text-sm leading-6 text-slate-600">
                                    Pesanan dapat dipantau dengan praktis.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mx-auto w-full max-w-lg">
                        <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-emerald-100 to-lime-100 blur-xl" />
                        <div className="relative rounded-[2rem] border border-white bg-white p-8 shadow-2xl shadow-emerald-950/10 sm:p-12">
                            <div className="mx-auto flex aspect-square max-w-xs items-center justify-center rounded-full bg-emerald-50 p-8">
                                <img
                                    src="/logo_klinik2.png"
                                    alt="Logo Klinik Premysis Medika"
                                    className="w-full object-contain"
                                />
                            </div>
                            <div className="mt-8 text-center">
                                <p className="text-xs font-bold tracking-[0.2em] text-emerald-700 uppercase">
                                    Klinik Premysis Medika
                                </p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">
                                    Peduli kesehatan, setiap hari.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
