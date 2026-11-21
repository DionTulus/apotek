import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { Auth } from '@/types';
import { send } from '@/routes/verification';
import { CheckCircle2, LockKeyhole, UserRound } from 'lucide-react';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Profil Saya" />

            <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <p className="mb-2 text-sm font-semibold text-blue-600">
                        Akun Anda
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Profil Saya
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Kelola informasi pribadi yang digunakan pada akun Anda.
                    </p>
                </div>

                <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <UserRound className="h-7 w-7" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                            {auth.user.name}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                            {auth.user.email}
                        </p>
                    </div>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Informasi Pribadi
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Perbarui nama dan alamat email akun Anda.
                        </p>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="name"
                                        className="text-sm font-medium text-slate-700"
                                    >
                                        Nama
                                    </label>
                                    <input
                                        id="name"
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nama lengkap"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <label
                                        htmlFor="email"
                                        className="text-sm font-medium text-slate-700"
                                    >
                                        Alamat Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="email@contoh.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                                            <p>
                                                Email Anda belum terverifikasi.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="font-semibold underline underline-offset-2"
                                                >
                                                    Kirim ulang tautan
                                                    verifikasi
                                                </Link>
                                            </p>
                                            {status ===
                                                'verification-link-sent' && (
                                                <p className="mt-2 flex items-center gap-2 font-medium text-emerald-700">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Tautan verifikasi baru telah
                                                    dikirim ke email Anda.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                <div className="pt-2">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                        className="rounded-lg bg-blue-600 px-5 text-white hover:bg-blue-700"
                                    >
                                        {processing
                                            ? 'Menyimpan...'
                                            : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <LockKeyhole className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Keamanan Akun
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Ganti kata sandi untuk menjaga keamanan akun
                                Anda.
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        className="shrink-0 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Link href={editSecurity()}>Ganti Kata Sandi</Link>
                    </Button>
                </section>

                <div className="mt-6">
                    <DeleteUser />
                </div>
            </main>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profil Saya',
            href: edit(),
        },
    ],
};
