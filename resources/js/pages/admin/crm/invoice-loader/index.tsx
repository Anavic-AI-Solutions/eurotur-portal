import { Form, Head, Link } from '@inertiajs/react';
import InvoiceLoaderHistoryController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceLoaderHistoryController';
import InvoiceProposalController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceProposalController';
import { PageHeader } from '@/components/backoffice/page-header';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';

const REQUIRED_COLUMNS = [
    'Proveedores',
    'Fecha comprobante',
    'Tipo comprobante',
    'Nro. comprobante',
    'Cód. clasificación',
    'Descripción Clasificación',
    'Estado',
    'Fecha vto.',
    'Debe',
    'Haber',
    'Importe',
    'Acumulado',
    'Leyenda',
];

export default function InvoiceLoaderIndex() {
    return (
        <>
            <Head title="Cargador de Facturas" />

            <PageHeader
                eyebrow="Herramientas"
                title="Cargador de Facturas"
                description="Subí el Excel de Tango (Resumen de Cta Proveedores) para generar una propuesta de carga a Tourplan."
                action={
                    <Button variant="outline" asChild>
                        <Link href={InvoiceLoaderHistoryController.index()}>
                            Histórico
                        </Link>
                    </Button>
                }
            />

            <div className="mt-6 max-w-xl space-y-8">
                <Form
                    {...InvoiceProposalController.store.form()}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-1">
                                <input
                                    type="file"
                                    name="file"
                                    accept=".xlsx"
                                    required
                                />
                                <InputError message={errors.file} />
                            </div>

                            <Button type="submit" disabled={processing}>
                                Generar propuesta
                            </Button>
                        </>
                    )}
                </Form>

                <div className="border-t border-border pt-4">
                    <p className="mb-2 bo-label">
                        El excel debe tener estas 13 columnas, en este orden
                        exacto
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {REQUIRED_COLUMNS.join(', ')}
                    </p>
                </div>
            </div>
        </>
    );
}
