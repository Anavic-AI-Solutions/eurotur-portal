import { Head } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import Heading from '@/components/heading';
import UserForm from './user-form';
import type { RoleOption } from './user-form';

export default function CreateUser({ roles }: { roles: RoleOption[] }) {
    return (
        <>
            <Head title="Nuevo usuario" />

            <div className="space-y-6">
                <Heading
                    title="Nuevo usuario"
                    description="Creá la cuenta y asignale un rol."
                />

                <UserForm
                    action={UserController.store.form()}
                    roles={roles}
                    submitLabel="Crear usuario"
                />
            </div>
        </>
    );
}
