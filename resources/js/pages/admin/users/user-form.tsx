import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import { boFieldClass } from '@/components/backoffice/field';
import { SectionHeading } from '@/components/backoffice/section-heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index } from '@/routes/admin/users';
import type { RouteFormDefinition } from '@/wayfinder';

export type RoleOption = { id: number; name: string; slug: string };
export type PrepagosRoleOption = { value: string; label: string };

const PREPAGOS_ROLE_NONE = '__none__';
const PREPAGOS_ROLE_ANALISTA = 'ANALISTA';

type UserFormData = {
    name: string;
    email: string;
    role_id: string;
    password: string;
    password_confirmation: string;
    prepagos_role: string;
    prepagos_analista_codigo: string;
};

export type EditableUser = {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
    prepagos_role: string | null;
    prepagos_analista_codigo: number | null;
};

/**
 * Shared by the create and edit pages: `action` carries the Wayfinder form
 * props, `user` prefills the fields when editing.
 */
export default function UserForm({
    action,
    roles,
    prepagosRoles,
    user,
    submitLabel,
}: {
    action: RouteFormDefinition<'post'>;
    roles: RoleOption[];
    prepagosRoles: PrepagosRoleOption[];
    user?: EditableUser;
    submitLabel: string;
}) {
    const [roleId, setRoleId] = useState(
        String(user?.role_id ?? roles[0]?.id ?? ''),
    );
    const selectedRole = roles.find((role) => String(role.id) === roleId);

    const [prepagosRole, setPrepagosRole] = useState(
        user?.prepagos_role ?? PREPAGOS_ROLE_NONE,
    );

    return (
        <Form<UserFormData> {...action} className="max-w-3xl">
            {({ processing, errors }) => (
                <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="space-y-6">
                        <div className="grid gap-1">
                            <Label htmlFor="name" className="bo-label">
                                Nombre
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={user?.name}
                                required
                                autoComplete="name"
                                className={boFieldClass}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-1">
                            <Label htmlFor="email" className="bo-label">
                                Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={user?.email}
                                required
                                autoComplete="email"
                                className={boFieldClass}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-1">
                            <Label htmlFor="password" className="bo-label">
                                Contraseña
                                {user && (
                                    <span className="ml-1 text-muted-foreground normal-case">
                                        (dejar vacío para no cambiarla)
                                    </span>
                                )}
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required={!user}
                                autoComplete="new-password"
                                className={boFieldClass}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-1">
                            <Label
                                htmlFor="password_confirmation"
                                className="bo-label"
                            >
                                Repetir contraseña
                            </Label>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                required={!user}
                                autoComplete="new-password"
                                className={boFieldClass}
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {submitLabel}
                            </Button>

                            <Button variant="ghost" asChild>
                                <Link href={index()}>Cancelar</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="border border-border p-5">
                        <SectionHeading label="Rol" />

                        <input type="hidden" name="role_id" value={roleId} />
                        <Select value={roleId} onValueChange={setRoleId}>
                            <SelectTrigger
                                id="role_id"
                                className="rounded-none"
                            >
                                <SelectValue placeholder="Elegí un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.id}
                                        value={String(role.id)}
                                    >
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role_id} />

                        {selectedRole && (
                            <p className="mt-3 bo-label text-muted-foreground normal-case">
                                Slug: {selectedRole.slug}
                            </p>
                        )}
                    </div>

                    <div className="border border-border p-5 md:col-start-2">
                        <SectionHeading label="Panel de Prepagos" />

                        <p className="mb-3 bo-label text-muted-foreground normal-case">
                            Solo importa si el usuario tiene el rol Analista,
                            Supervisor, o cualquier otro con el permiso
                            "Gestionar el panel de prepagos".
                        </p>

                        <div className="flex items-end gap-2">
                            {prepagosRole === PREPAGOS_ROLE_ANALISTA && (
                                <div className="grid w-20 gap-1">
                                    <Label
                                        htmlFor="prepagos_analista_codigo"
                                        className="bo-label"
                                    >
                                        Código
                                    </Label>
                                    <Input
                                        id="prepagos_analista_codigo"
                                        name="prepagos_analista_codigo"
                                        type="number"
                                        min={1}
                                        max={9}
                                        defaultValue={
                                            user?.prepagos_analista_codigo ?? ''
                                        }
                                        className={boFieldClass}
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                <input
                                    type="hidden"
                                    name="prepagos_role"
                                    value={
                                        prepagosRole === PREPAGOS_ROLE_NONE
                                            ? ''
                                            : prepagosRole
                                    }
                                />
                                <Select
                                    value={prepagosRole}
                                    onValueChange={setPrepagosRole}
                                >
                                    <SelectTrigger
                                        id="prepagos_role"
                                        className="w-full rounded-none"
                                    >
                                        <SelectValue placeholder="Sin asignar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={PREPAGOS_ROLE_NONE}>
                                            Sin asignar
                                        </SelectItem>
                                        {prepagosRoles.map((role) => (
                                            <SelectItem
                                                key={role.value}
                                                value={role.value}
                                            >
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <InputError message={errors.prepagos_role} />
                        <InputError message={errors.prepagos_analista_codigo} />
                    </div>
                </div>
            )}
        </Form>
    );
}
