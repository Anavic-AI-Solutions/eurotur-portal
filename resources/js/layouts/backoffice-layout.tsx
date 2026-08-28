import { Head } from '@inertiajs/react';
import { BackofficeHeader } from '@/components/backoffice/backoffice-header';
import { BackofficeSidebar } from '@/components/backoffice/backoffice-sidebar';
import type { BreadcrumbItem } from '@/types';

/**
 * Shell for pages/admin/*: the portal's palette and type scale, scoped by
 * the `eurotur-backoffice` class in resources/css/app.css so settings/,
 * auth/ and dashboard keep the starter kit's look untouched.
 */
export default function BackofficeLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="eurotur-backoffice flex min-h-screen bg-background font-sans text-foreground">
                <div className="hidden md:flex">
                    <BackofficeSidebar />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                    <BackofficeHeader breadcrumbs={breadcrumbs} />
                    <main className="flex-1 px-8 pt-6 pb-16">{children}</main>
                </div>
            </div>
        </>
    );
}
