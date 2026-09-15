import { Form, Head, Link } from '@inertiajs/react';
import InvoiceExecutionController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceExecutionController';
import InvoiceLoaderHistoryController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceLoaderHistoryController';
import InvoiceProposalController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceProposalController';
import { PageHeader } from '@/components/backoffice/page-header';
import type { PaginationLink } from '@/components/backoffice/pagination';
import { Pagination } from '@/components/backoffice/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type JobRow = {
    id: number;
    job_id: string;
    kind: 'proposal' | 'execution';
    original_filename: string;
    dry_run: boolean | null;
    status: string | null;
    archived: boolean;
    created_at: string | null;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
};

const KIND_LABELS: Record<JobRow['kind'], string> = {
    proposal: 'Propuesta',
    execution: 'Ejecución',
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'En cola',
    RUNNING: 'Procesando',
    DONE: 'Lista',
    ERROR: 'Con error',
};

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

function liveShowHref(job: JobRow): string {
    return job.kind === 'proposal'
        ? InvoiceProposalController.show.url({ jobId: job.job_id })
        : InvoiceExecutionController.show.url({ jobId: job.job_id });
}

export default function InvoiceLoaderHistory({
    jobs,
}: {
    jobs: Paginated<JobRow>;
}) {
    return (
        <>
            <Head title="Cargador de Facturas — Histórico" />

            <PageHeader
                eyebrow="Herramientas / Cargador de Facturas"
                title="Histórico"
                description="Tus propuestas y ejecuciones anteriores — sobrevive aunque cierres la pestaña o el microservicio se reinicie."
            />

            <div className="mt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Archivo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.data.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell className="text-sm whitespace-nowrap">
                                    {formatDate(job.created_at)}
                                </TableCell>
                                <TableCell>
                                    {KIND_LABELS[job.kind]}
                                    {job.kind === 'execution' &&
                                        job.dry_run !== null && (
                                            <span className="ml-2 bo-label text-muted-foreground">
                                                {job.dry_run
                                                    ? 'simulación'
                                                    : 'real'}
                                            </span>
                                        )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {job.original_filename}
                                </TableCell>
                                <TableCell>
                                    {job.status ? (
                                        <Badge
                                            variant={
                                                job.status === 'ERROR'
                                                    ? 'destructive'
                                                    : 'outline'
                                            }
                                        >
                                            {STATUS_LABELS[job.status] ??
                                                job.status}
                                        </Badge>
                                    ) : (
                                        <span className="bo-label text-muted-foreground">
                                            Sin verificar
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {job.archived ? (
                                            job.kind === 'proposal' ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <a
                                                        href={InvoiceLoaderHistoryController.file.url(
                                                            {
                                                                invoiceLoaderJob:
                                                                    job.id,
                                                            },
                                                        )}
                                                    >
                                                        Descargar
                                                    </a>
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <a
                                                            href={InvoiceLoaderHistoryController.report.url(
                                                                {
                                                                    invoiceLoaderJob:
                                                                        job.id,
                                                                },
                                                            )}
                                                        >
                                                            Reporte
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <a
                                                            href={InvoiceLoaderHistoryController.log.url(
                                                                {
                                                                    invoiceLoaderJob:
                                                                        job.id,
                                                                },
                                                            )}
                                                        >
                                                            Log
                                                        </a>
                                                    </Button>
                                                </>
                                            )
                                        ) : (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={liveShowHref(job)}
                                                    >
                                                        Ver estado
                                                    </Link>
                                                </Button>
                                                <Form
                                                    {...InvoiceLoaderHistoryController.recheck.form(
                                                        {
                                                            invoiceLoaderJob:
                                                                job.id,
                                                        },
                                                    )}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            Revisar ahora
                                                        </Button>
                                                    )}
                                                </Form>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {jobs.data.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-6 text-center bo-label"
                                >
                                    Todavía no subiste ninguna propuesta.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <Pagination links={jobs.links} />
            </div>
        </>
    );
}
