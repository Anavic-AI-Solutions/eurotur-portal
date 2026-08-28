import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Icon-button row actions. Deliberately not the portal's `all: unset` glyph
 * buttons — that pattern drops the focus outline and the button's implicit
 * role, so this keeps shadcn's Button and just narrows it down to an icon.
 */
export function RowActions({
    editHref,
    editLabel,
    children,
}: {
    editHref: NonNullable<InertiaLinkProps['href']>;
    editLabel: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex items-center justify-end gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-none"
                asChild
            >
                <Link href={editHref}>
                    <Pencil className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">{editLabel}</span>
                </Link>
            </Button>

            {children}
        </div>
    );
}
