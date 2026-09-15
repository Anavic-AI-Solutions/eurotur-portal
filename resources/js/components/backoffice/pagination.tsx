import { Link } from '@inertiajs/react';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export function Pagination({ links }: { links: PaginationLink[] }) {
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
