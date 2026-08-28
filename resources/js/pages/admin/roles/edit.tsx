import { Head } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import Heading from '@/components/heading';
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

            <div className="space-y-6">
                <Heading
                    title={`Rol: ${role.name}`}
                    description="Marcá los permisos que este rol debe tener."
                />

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
