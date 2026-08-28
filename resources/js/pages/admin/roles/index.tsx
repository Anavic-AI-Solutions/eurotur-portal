import { Form, Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import { PageHeader } from '@/components/backoffice/page-header';
import { RowActions } from '@/components/backoffice/row-actions';
import { TableFilter } from '@/components/backoffice/table-filter';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
    const [query, setQuery] = useState('');

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();

        if (!needle) {
            return roles;
        }

        return roles.filter((role) =>
            [role.name, role.slug, role.description ?? '']
                .join(' ')
                .toLowerCase()
                .includes(needle),
        );
    }, [roles, query]);

    return (
        <>
            <Head title="Roles" />

            <PageHeader
                eyebrow="Administración"
                title="Roles"
                description="Definí qué puede hacer cada grupo de personas."
                action={
                    <Button asChild>
                        <Link href={RoleController.create()}>Nuevo rol</Link>
                    </Button>
                }
            />

            <div className="mt-6">
                <TableFilter
                    value={query}
                    onChange={setQuery}
                    placeholder="Filtrar por nombre o slug…"
                    matched={visible.length}
                    total={roles.length}
                />

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rol</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Permisos</TableHead>
                            <TableHead>Sistema</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visible.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-bold">
                                    {role.name}
                                    {role.description && (
                                        <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                                            {role.description}
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell className="text-[11px] font-[var(--bo-mono)] text-muted-foreground">
                                    {role.slug}
                                </TableCell>
                                <TableCell>
                                    <span className="text-[15px] font-black tracking-[-0.02em]">
                                        {role.permissions_count}
                                    </span>
                                    <span className="ml-1 bo-label">
                                        · {role.users_count} usuarios
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {role.is_system && (
                                        <span
                                            className="text-primary"
                                            aria-label="Rol del sistema"
                                        >
                                            ●
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <RowActions
                                        editHref={RoleController.edit(role.id)}
                                        editLabel={`Editar ${role.name}`}
                                    >
                                        {!role.is_system &&
                                            role.users_count === 0 && (
                                                <Form
                                                    {...RoleController.destroy.form(
                                                        role.id,
                                                    )}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 rounded-none text-primary hover:text-primary"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <span aria-hidden="true">
                                                                ✕
                                                            </span>
                                                            <span className="sr-only">
                                                                Eliminar{' '}
                                                                {role.name}
                                                            </span>
                                                        </Button>
                                                    )}
                                                </Form>
                                            )}
                                    </RowActions>
                                </TableCell>
                            </TableRow>
                        ))}

                        {visible.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-6 text-center bo-label"
                                >
                                    {roles.length === 0
                                        ? 'Todavía no hay roles.'
                                        : 'Sin resultados para el filtro.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
