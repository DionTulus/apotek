import { Link, usePage } from '@inertiajs/react';
import type { AuthLayoutProps } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { component } = usePage();
    const logoSrc = ['auth/login', 'auth/register'].includes(component)
        ? '/logo_klinik.png'
        : '/logo_klinik2.png';

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(460px,0.9fr)]">
            <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
                <div className="absolute -top-36 -right-36 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />

                <Link
                    href={home()}
                    className="relative z-10 inline-flex w-fit items-center gap-4 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/10"
                >
                    <img
                        src={logoSrc}
                        alt="Apotek Premysis Medika"
                        className="h-14 w-12 object-contain"
                    />
                    <span className="text-sm font-bold tracking-wide text-emerald-950">
                        APOTEK PREMISYS
                        <br />
                        MEDIKA
                    </span>
                </Link>

                <div className="relative z-10 max-w-xl pb-8">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-emerald-50">
                        <span className="h-2 w-2 rounded-full bg-lime-300" />
                        Layanan apotek dalam satu tempat
                    </span>
                    <h2 className="mt-8 text-4xl leading-tight font-semibold tracking-tight xl:text-5xl">
                        Kesehatan Anda, prioritas kami.
                    </h2>
                    <p className="mt-5 max-w-lg text-base leading-7 text-emerald-50/80">
                        Masuk untuk mengelola akun, melihat pesanan, dan
                        mendapatkan layanan apotek dengan lebih mudah.
                    </p>
                </div>

                <p className="relative z-10 text-sm text-emerald-100/70">
                    Apotek Premysis Medika
                </p>
            </section>

            <section className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-24">
                <div className="mx-auto w-full max-w-md">
                    <Link
                        href={home()}
                        className="mb-10 inline-flex items-center gap-3 lg:hidden"
                    >
                        {logoSrc === '/logo_klinik.png' ? (
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm">
                                <AppLogoIcon className="h-6 w-6" />
                            </span>
                        ) : (
                            <img
                                src={logoSrc}
                                alt="Logo Apotek Premysis Medika"
                                className="h-11 w-11 object-contain"
                            />
                        )}
                        <span className="text-sm font-bold text-emerald-900">
                            Apotek Premysis Medika
                        </span>
                    </Link>

                    <Link
                        href={home()}
                        className="mb-8 hidden text-sm font-medium text-slate-500 transition hover:text-emerald-800 lg:inline-flex"
                    >
                        ← Kembali ke beranda
                    </Link>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-9">
                        <div className="mb-8 space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {title}
                            </h1>
                            <p className="text-sm leading-6 text-slate-500">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-400">
                        © {new Date().getFullYear()} Apotek Premysis Medika
                    </p>
                </div>
            </section>
        </main>
    );
}
