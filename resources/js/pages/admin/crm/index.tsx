import { Head, Link } from '@inertiajs/react';
import InvoiceLoaderPageController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceLoaderPageController';
import { PageHeader } from '@/components/backoffice/page-header';
import type { RouteDefinition } from '@/wayfinder';

type CrmTool = {
    label: string;
    description: string;
    href: RouteDefinition<'get'>;
};

/** Ordered — the first entry is the first option under Herramientas. */
const TOOLS: CrmTool[] = [
    {
        label: 'Cargador de Facturas',
        description:
            'Subí el Excel de Tango, revisá la propuesta y cargá las facturas de proveedores en Tourplan.',
        href: InvoiceLoaderPageController.index(),
    },
];

export default function CrmIndex() {
    return (
        <>
            <Head title="Herramientas" />

            <PageHeader
                eyebrow="Administración"
                title="Herramientas"
                description="Herramientas de integración con sistemas externos."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {TOOLS.map((tool) => (
                    <Link
                        key={tool.label}
                        href={tool.href}
                        className="block border border-border p-5 transition-colors hover:border-primary"
                    >
                        <div className="text-[15px] font-bold">
                            {tool.label}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {tool.description}
                        </p>
                    </Link>
                ))}
            </div>
        </>
    );
}
