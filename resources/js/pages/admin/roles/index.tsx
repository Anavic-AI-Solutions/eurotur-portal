import { Form, Head, Link } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type RoleRow = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    is_system: boolean;
    users_count: number;
    permissions_count: number;
};

export default function RolesIndex({ roles }: { roles: RoleRow[] }) {
    return (
        <>
            <Head title="Roles" />

            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Roles"
                        description="Definí qué puede hacer cada grupo de personas."
                    />

                    <Button asChild>
                        <Link href={RoleController.create()}>Nuevo rol</Link>
                    </Button>
                </div>

                <div className="divide-y rounded-lg border">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="flex flex-wrap items-center justify-between gap-3 p-4"
                        >
                            <div className="min-w-0">
                                <p className="flex items-center gap-2 font-medium">
                                    {role.name}
                                    {role.is_system && (
                                        <Badge variant="outline">Sistema</Badge>
                                    )}
                                </p>
                                <p className="truncate text-sm text-muted-foreground">
                                    {role.description ??
                                        `${role.permissions_count} permisos · ${role.users_count} usuarios`}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={RoleController.edit(role.id)}>
                                        Editar
                                    </Link>
                                </Button>

                                {!role.is_system && role.users_count === 0 && (
                                    <Form
                                        {...RoleController.destroy.form(
                                            role.id,
                                        )}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                size="sm"
                                                disabled={processing}
                                            >
                                                Eliminar
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
