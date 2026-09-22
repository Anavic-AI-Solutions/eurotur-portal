import { Head } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { PageHeader } from '@/components/backoffice/page-header';
import UserForm from './user-form';
import type { PrepagosRoleOption, RoleOption } from './user-form';

export default function CreateUser({
    roles,
    prepagosRoles,
}: {
    roles: RoleOption[];
    prepagosRoles: PrepagosRoleOption[];
}) {
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
                    prepagosRoles={prepagosRoles}
                    submitLabel="Crear usuario"
                />
            </div>
        </>
    );
}
