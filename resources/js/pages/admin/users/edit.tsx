import { Head } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import Heading from '@/components/heading';
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

            <div className="space-y-6">
                <Heading
                    title="Editar usuario"
                    description="Actualizá los datos de la cuenta o cambiale el rol."
                />

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
