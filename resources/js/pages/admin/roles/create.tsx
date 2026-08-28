import { Head } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import { PageHeader } from '@/components/backoffice/page-header';
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

            <PageHeader
                eyebrow="Administración — roles"
                title="Nuevo rol"
                description="Elegí los permisos que tendrá este rol."
            />

            <div className="mt-6">
                <RoleForm
                    action={RoleController.store.form()}
                    permissionGroups={permissionGroups}
                    submitLabel="Crear rol"
                />
            </div>
        </>
    );
}
