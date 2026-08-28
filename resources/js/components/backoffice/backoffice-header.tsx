import { usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { BackofficeSidebar } from '@/components/backoffice/backoffice-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import type { BreadcrumbItem } from '@/types';

export function BackofficeHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItem[];
}) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage().props;

    return (
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-6">
            <div className="flex items-center gap-3">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-none md:hidden"
                        >
                            <Menu className="size-5" />
                            <span className="sr-only">Abrir navegación</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="w-[216px] p-0 sm:max-w-none"
                    >
                        <SheetTitle className="sr-only">Navegación</SheetTitle>
                        <BackofficeSidebar onNavigate={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>

                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {auth?.user && <span className="bo-label">{auth.user.name}</span>}
        </header>
    );
}
