import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <Form<RoleFormData> {...action} className="space-y-6">
            {({ processing, errors }) => (
                <>
                    <div className="grid max-w-xl gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={role?.name}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid max-w-xl gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            name="description"
                            defaultValue={role?.description ?? ''}
                        />
                        <InputError message={errors.description} />
                    </div>

                    {granted.map((slug) => (
                        <input
                            key={slug}
                            type="hidden"
                            name="permissions[]"
                            value={slug}
                        />
                    ))}

                    {locked && (
                        <p className="text-sm text-muted-foreground">
                            El rol Administrador siempre tiene todos los
                            permisos: su matriz es de solo lectura.
                        </p>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        {permissionGroups.map((group) => {
                            const allChecked = group.permissions.every(
                                (permission) =>
                                    locked || granted.includes(permission.slug),
                            );

                            return (
                                <Card key={group.key}>
                                    <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                                        <CardTitle className="text-base">
                                            {group.label}
                                        </CardTitle>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={locked}
                                            onClick={() =>
                                                toggleGroup(group, !allChecked)
                                            }
                                        >
                                            {allChecked ? 'Ninguno' : 'Todos'}
                                        </Button>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        {group.permissions.map((permission) => (
                                            <div
                                                key={permission.slug}
                                                className="flex items-center gap-2"
                                            >
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
                                                <Label
                                                    htmlFor={permission.slug}
                                                    className="font-normal"
                                                >
                                                    {permission.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3">
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
