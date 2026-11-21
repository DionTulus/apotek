import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-4 rounded-2xl border border-rose-200 bg-white p-5 shadow-sm sm:p-8">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">
                    Hapus Akun
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Hapus akun dan seluruh data yang terkait secara permanen.
                </p>
            </div>
            <div className="space-y-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-rose-800">
                <div className="space-y-1">
                    <p className="font-semibold">Perhatian</p>
                    <p className="text-sm">
                        Tindakan ini tidak dapat dibatalkan. Pastikan Anda
                        benar-benar ingin menghapus akun.
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                        >
                            Hapus Akun
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            Apakah Anda yakin ingin menghapus akun?
                        </DialogTitle>
                        <DialogDescription>
                            Semua data akun akan dihapus secara permanen.
                            Masukkan kata sandi untuk mengonfirmasi tindakan
                            ini.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="sr-only"
                                        >
                                            Kata Sandi
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Kata sandi"
                                            autoComplete="current-password"
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            asChild
                                        >
                                            <button
                                                type="submit"
                                                data-test="confirm-delete-user-button"
                                            >
                                                Ya, Hapus Akun
                                            </button>
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
