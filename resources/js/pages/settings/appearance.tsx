import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Pengaturan Tampilan" />

            <h1 className="sr-only">Pengaturan Tampilan</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Pengaturan Tampilan"
                    description="Sesuaikan tampilan aplikasi untuk akun Anda."
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Tampilan',
            href: editAppearance(),
        },
    ],
};
