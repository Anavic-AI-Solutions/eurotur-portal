import { Head } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import Heading from '@/components/heading';
import RoleForm from './role-form';
import type { PermissionGroup } from './role-form';

export default function CreateRole({
    permissionGroups,
}: {
    permissionGroups: PermissionGroup[];
}) {
    return (
        <>
            <Head title="Nuevo rol" />

            <div className="space-y-6">
                <Heading
                    title="Nuevo rol"
                    description="Elegí los permisos que tendrá este rol."
                />

                <RoleForm
                    action={RoleController.store.form()}
                    permissionGroups={permissionGroups}
                    submitLabel="Crear rol"
                />
            </div>
        </>
    );
}
