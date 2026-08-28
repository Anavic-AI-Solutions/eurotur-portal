import { Form, Head, Link } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: { id: number; name: string; slug: string } | null;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

export default function UsersIndex({ users }: { users: Paginated<UserRow> }) {
    return (
        <>
            <Head title="Usuarios" />

            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Usuarios"
                        description="Altas, bajas y asignación de roles."
                    />

                    <Button asChild>
                        <Link href={UserController.create()}>
                            Nuevo usuario
                        </Link>
                    </Button>
                </div>

                <div className="divide-y rounded-lg border">
                    {users.data.map((user) => (
                        <div
                            key={user.id}
                            className="flex flex-wrap items-center justify-between gap-3 p-4"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-medium">
                                    {user.name}
                                </p>
                                <p className="truncate text-sm text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    {user.role?.name ?? 'Sin rol'}
                                </Badge>

                                <Button variant="outline" size="sm" asChild>
                                    <Link href={UserController.edit(user.id)}>
                                        Editar
                                    </Link>
                                </Button>

                                <DeleteUserDialog user={user} />
                            </div>
                        </div>
                    ))}

                    {users.data.length === 0 && (
                        <p className="p-4 text-sm text-muted-foreground">
                            Todavía no hay usuarios.
                        </p>
                    )}
                </div>

                <Pagination links={users.links} />
            </div>
        </>
    );
}

function DeleteUserDialog({ user }: { user: UserRow }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Eliminar
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar a {user.name}</DialogTitle>
                    <DialogDescription>
                        Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>

                    <Form {...UserController.destroy.form(user.id)}>
                        {({ processing }) => (
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                            >
                                Eliminar
                            </Button>
                        )}
                    </Form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Pagination({ links }: { links: Paginated<UserRow>['links'] }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
                <Button
                    key={link.label}
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    disabled={!link.url}
                    asChild={Boolean(link.url)}
                >
                    {link.url ? (
                        <Link
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )}
                </Button>
            ))}
        </nav>
    );
}
