import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
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

type UserFormData = {
    name: string;
    email: string;
    role_id: string;
    password: string;
    password_confirmation: string;
};

export type EditableUser = {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
};

/**
 * Shared by the create and edit pages: `action` carries the Wayfinder form
 * props, `user` prefills the fields when editing.
 */
export default function UserForm({
    action,
    roles,
    user,
    submitLabel,
}: {
    action: RouteFormDefinition<'post'>;
    roles: RoleOption[];
    user?: EditableUser;
    submitLabel: string;
}) {
    const [roleId, setRoleId] = useState(
        String(user?.role_id ?? roles[0]?.id ?? ''),
    );

    return (
        <Form<UserFormData> {...action} className="max-w-xl space-y-6">
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={user?.name}
                            required
                            autoComplete="name"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={user?.email}
                            required
                            autoComplete="email"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role_id">Rol</Label>
                        <input type="hidden" name="role_id" value={roleId} />
                        <Select value={roleId} onValueChange={setRoleId}>
                            <SelectTrigger id="role_id">
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
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            Contraseña
                            {user && (
                                <span className="ml-1 text-muted-foreground">
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
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Repetir contraseña
                        </Label>
                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            required={!user}
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password_confirmation} />
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
