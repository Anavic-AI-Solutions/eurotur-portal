import { Form, Head, Link } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { PageHeader } from '@/components/backoffice/page-header';
import { RowActions } from '@/components/backoffice/row-actions';
import { TableFilter } from '@/components/backoffice/table-filter';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
    const [query, setQuery] = useState('');

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();

        if (!needle) {
            return users.data;
        }

        return users.data.filter((user) =>
            [user.name, user.email, user.role?.name ?? '']
                .join(' ')
                .toLowerCase()
                .includes(needle),
        );
    }, [users.data, query]);

    return (
        <>
            <Head title="Usuarios" />

            <PageHeader
                eyebrow="Administración"
                title="Usuarios"
                description="Altas, bajas y asignación de roles."
                action={
                    <Button asChild>
                        <Link href={UserController.create()}>
                            Nuevo usuario
                        </Link>
                    </Button>
                }
            />

            <div className="mt-6">
                <TableFilter
                    value={query}
                    onChange={setQuery}
                    placeholder="Filtrar por nombre, email o rol…"
                    matched={visible.length}
                    total={users.data.length}
                />

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visible.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-bold">
                                    {user.name}
                                </TableCell>
                                <TableCell className="text-[11px] font-[var(--bo-mono)] text-muted-foreground">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    {user.role ? (
                                        <span className="inline-block border border-foreground px-[6px] py-[2px] bo-label text-foreground">
                                            {user.role.name}
                                        </span>
                                    ) : (
                                        <span className="bo-label">
                                            Sin rol
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <RowActions
                                        editHref={UserController.edit(user.id)}
                                        editLabel={`Editar a ${user.name}`}
                                    >
                                        <DeleteUserDialog user={user} />
                                    </RowActions>
                                </TableCell>
                            </TableRow>
                        ))}

                        {visible.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="py-6 text-center bo-label"
                                >
                                    {users.data.length === 0
                                        ? 'Todavía no hay usuarios.'
                                        : 'Sin resultados para el filtro.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <Pagination links={users.links} />
            </div>
        </>
    );
}

function DeleteUserDialog({ user }: { user: UserRow }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-none text-primary hover:text-primary"
                >
                    <X className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Eliminar a {user.name}</span>
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
        <nav className="mt-4 flex flex-wrap items-center gap-3">
            {links.map((link) =>
                link.url ? (
                    <Link
                        key={link.label}
                        href={link.url}
                        className={
                            'px-1 bo-label ' +
                            (link.active
                                ? 'text-primary'
                                : 'transition-colors duration-[120ms] hover:text-primary')
                        }
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={link.label}
                        className="px-1 bo-label opacity-40"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </nav>
    );
}
