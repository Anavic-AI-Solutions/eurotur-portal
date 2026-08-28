import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import { boFieldClass } from '@/components/backoffice/field';
import { SectionHeading } from '@/components/backoffice/section-heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableCell, TableRow } from '@/components/ui/table';
import { index } from '@/routes/admin/roles';
import type { RouteFormDefinition } from '@/wayfinder';

type RoleFormData = {
    name: string;
    description: string;
    permissions: string[];
};

export type PermissionGroup = {
    key: string;
    label: string;
    permissions: { slug: string; label: string }[];
};

export type EditableRole = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    is_system: boolean;
    permissions: string[];
};

/**
 * The permission matrix. `locked` is set for the admin role, which always holds
 * the whole catalogue and therefore cannot be narrowed here.
 */
export default function RoleForm({
    action,
    permissionGroups,
    role,
    locked = false,
    submitLabel,
}: {
    action: RouteFormDefinition<'post'>;
    permissionGroups: PermissionGroup[];
    role?: EditableRole;
    locked?: boolean;
    submitLabel: string;
}) {
    const [granted, setGranted] = useState<string[]>(role?.permissions ?? []);
    const totalPermissions = permissionGroups.reduce(
        (count, group) => count + group.permissions.length,
        0,
    );

    const toggle = (slug: string, checked: boolean) =>
        setGranted((current) =>
            checked
                ? [...new Set([...current, slug])]
                : current.filter((value) => value !== slug),
        );

    const toggleGroup = (group: PermissionGroup, checked: boolean) => {
        const slugs = group.permissions.map((permission) => permission.slug);

        setGranted((current) =>
            checked
                ? [...new Set([...current, ...slugs])]
                : current.filter((value) => !slugs.includes(value)),
        );
    };

    return (
        <Form<RoleFormData> {...action} className="max-w-3xl">
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="grid gap-1">
                            <Label htmlFor="name" className="bo-label">
                                Nombre
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={role?.name}
                                required
                                className={boFieldClass}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-1">
                            <Label htmlFor="description" className="bo-label">
                                Descripción
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                defaultValue={role?.description ?? ''}
                                className={boFieldClass}
                            />
                            <InputError message={errors.description} />
                        </div>
                    </div>

                    {granted.map((slug) => (
                        <input
                            key={slug}
                            type="hidden"
                            name="permissions[]"
                            value={slug}
                        />
                    ))}

                    <SectionHeading
                        label="Permisos"
                        hint={
                            locked
                                ? `${totalPermissions} de ${totalPermissions} otorgados`
                                : `${granted.length} de ${totalPermissions} otorgados`
                        }
                    />

                    {locked && (
                        <p className="border border-primary bg-muted px-3 py-2 text-sm text-primary">
                            El rol Administrador siempre tiene todos los
                            permisos: su matriz es de solo lectura.
                        </p>
                    )}

                    <Table>
                        {permissionGroups.map((group) => {
                            const allChecked = group.permissions.every(
                                (permission) =>
                                    locked || granted.includes(permission.slug),
                            );

                            return (
                                <tbody key={group.key}>
                                    <tr className="bo-rule-head">
                                        <TableCell
                                            colSpan={2}
                                            className="text-[13px] font-black"
                                        >
                                            {group.label}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="rounded-none"
                                                disabled={locked}
                                                onClick={() =>
                                                    toggleGroup(
                                                        group,
                                                        !allChecked,
                                                    )
                                                }
                                            >
                                                {allChecked
                                                    ? 'Ninguno'
                                                    : 'Todos'}
                                            </Button>
                                        </TableCell>
                                    </tr>

                                    {group.permissions.map((permission) => (
                                        <TableRow key={permission.slug}>
                                            <TableCell className="w-10">
                                                <Checkbox
                                                    id={permission.slug}
                                                    disabled={locked}
                                                    checked={
                                                        locked ||
                                                        granted.includes(
                                                            permission.slug,
                                                        )
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        toggle(
                                                            permission.slug,
                                                            checked === true,
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Label
                                                    htmlFor={permission.slug}
                                                    className="font-normal"
                                                >
                                                    {permission.label}
                                                </Label>
                                            </TableCell>
                                            <TableCell className="text-right text-[10px] font-[var(--bo-mono)] text-muted-foreground">
                                                {permission.slug}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </tbody>
                            );
                        })}
                    </Table>

                    <div className="mt-6 flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {submitLabel}
                        </Button>

                        <Button variant="ghost" asChild>
                            <Link href={index()}>Cancelar</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
