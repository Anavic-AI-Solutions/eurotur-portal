import { Head, Link } from '@inertiajs/react';
import InvoiceLoaderPageController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceLoaderPageController';
import { PageHeader } from '@/components/backoffice/page-header';
import { usePermissions } from '@/hooks/use-permissions';
import { prepagos } from '@/routes/admin';
import type { RouteDefinition } from '@/wayfinder';

type CrmTool = {
    label: string;
    description: string;
    href: RouteDefinition<'get'>;
    permission: string;
    /** Opens in a new tab instead of an Inertia visit — for tools hosted outside the portal. */
    external?: boolean;
};

/** Ordered — the first entry is the first option under Herramientas. */
const TOOLS: CrmTool[] = [
    {
        label: 'Cargador de Facturas',
        description:
            'Subí el Excel de Tango, revisá la propuesta y cargá las facturas de proveedores en Tourplan.',
        href: InvoiceLoaderPageController.index(),
        permission: 'invoice-loader.manage',
    },
    {
        label: 'Panel de Prepagos',
        description:
            'Calculá los importes a pagar a proveedores, revisá riesgos de sobrepago y gestioná la bandeja del analista.',
        href: prepagos(),
        permission: 'prepagos.manage',
        external: true,
    },
];

export default function CrmIndex() {
    const { can } = usePermissions();
    const tools = TOOLS.filter((tool) => can(tool.permission));

    return (
        <>
            <Head title="Herramientas" />

            <PageHeader
                eyebrow="Administración"
                title="Herramientas"
                description="Herramientas de integración con sistemas externos."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) =>
                    tool.external ? (
                        <a
                            key={tool.label}
                            href={tool.href.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block border border-border p-5 transition-colors hover:border-primary"
                        >
                            <div className="text-[15px] font-bold">
                                {tool.label}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {tool.description}
                            </p>
                        </a>
                    ) : (
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
                    ),
                )}
            </div>
        </>
    );
}
