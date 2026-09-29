import { Head } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { PageHeader } from '@/components/backoffice/page-header';
import UserForm from './user-form';
import type { EditableUser, RoleOption } from './user-form';

export default function EditUser({
    user,
    roles,
}: {
    user: EditableUser;
    roles: RoleOption[];
}) {
    return (
        <>
            <Head title={`Editar ${user.name}`} />

            <PageHeader
                eyebrow="Administración — usuarios"
                title="Editar usuario"
                description="Actualizá los datos de la cuenta o cambiale el rol."
            />

            <div className="mt-6">
                <UserForm
                    action={UserController.update.form(user.id)}
                    roles={roles}
                    user={user}
                    submitLabel="Guardar cambios"
                />
            </div>
        </>
    );
}
