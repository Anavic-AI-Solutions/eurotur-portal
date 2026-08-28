import { Head } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { PageHeader } from '@/components/backoffice/page-header';
import UserForm from './user-form';
import type { RoleOption } from './user-form';

export default function CreateUser({ roles }: { roles: RoleOption[] }) {
    return (
        <>
            <Head title="Nuevo usuario" />

            <PageHeader
                eyebrow="Administración — usuarios"
                title="Nuevo usuario"
                description="Creá la cuenta y asignale un rol."
            />

            <div className="mt-6">
                <UserForm
                    action={UserController.store.form()}
                    roles={roles}
                    submitLabel="Crear usuario"
                />
            </div>
        </>
    );
}
