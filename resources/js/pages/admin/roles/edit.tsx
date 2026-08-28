import { Head } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import { PageHeader } from '@/components/backoffice/page-header';
import RoleForm from './role-form';
import type { EditableRole, PermissionGroup } from './role-form';

export default function EditRole({
    role,
    permissionGroups,
    locked,
}: {
    role: EditableRole;
    permissionGroups: PermissionGroup[];
    locked: boolean;
}) {
    return (
        <>
            <Head title={`Editar ${role.name}`} />

            <PageHeader
                eyebrow="Administración — roles"
                title={`Rol: ${role.name}`}
                description="Marcá los permisos que este rol debe tener."
            />

            <div className="mt-6">
                <RoleForm
                    action={RoleController.update.form(role.id)}
                    permissionGroups={permissionGroups}
                    role={role}
                    locked={locked}
                    submitLabel="Guardar cambios"
                />
            </div>
        </>
    );
}
