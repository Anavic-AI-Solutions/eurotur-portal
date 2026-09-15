import { Head, Link, usePoll } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import InvoiceExecutionController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceExecutionController';
import InvoiceLoaderHistoryController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceLoaderHistoryController';
import { PageHeader } from '@/components/backoffice/page-header';
import { Button } from '@/components/ui/button';
import { formatElapsed } from '@/lib/invoice-loader/format-elapsed';

type JobStatus = {
    job_id: string;
    kind: 'execution';
    status: 'PENDING' | 'RUNNING' | 'DONE' | 'ERROR';
    progress_current: number;
    progress_total: number;
    error: string | null;
};

const STATUS_LABELS: Record<JobStatus['status'], string> = {
    PENDING: 'En cola',
    RUNNING: 'Procesando',
    DONE: 'Lista',
    ERROR: 'Con error',
};

function ProgressBar({ current, total }: { current: number; total: number }) {
    const pct =
        total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

    return (
        <div className="h-2 w-full border border-foreground">
            <div
                className="h-full bg-primary transition-[width] duration-300"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

export default function InvoiceLoaderExecution({
    jobId,
    status,
    dryRun,
    createdAt,
}: {
    jobId: string;
    status: JobStatus;
    dryRun: boolean;
    createdAt: string | null;
}) {
    const finished = status.status === 'DONE' || status.status === 'ERROR';
    const { stop } = usePoll(2000, { only: ['status'] });
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (finished) {
            stop();
        }
    }, [finished, stop]);

    useEffect(() => {
        if (finished || !createdAt) {
            return;
        }

        const startedAt = new Date(createdAt).getTime();
        const tick = () =>
            setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));

        tick();
        const interval = setInterval(tick, 1000);

        return () => clearInterval(interval);
    }, [finished, createdAt]);

    return (
        <>
            <Head title="Cargador de Facturas — Ejecución" />

            <PageHeader
                eyebrow="Herramientas / Cargador de Facturas"
                title="Ejecución"
                description={`Job ${jobId}`}
            />

            <div className="mt-6 max-w-xl space-y-4">
                <span
                    className={
                        'inline-block border px-[6px] py-[2px] bo-label ' +
                        (dryRun
                            ? 'border-foreground text-foreground'
                            : 'border-destructive text-destructive')
                    }
                >
                    {dryRun
                        ? 'Simulación — no escribió en Tourplan'
                        : 'Carga real — insertó en Tourplan'}
                </span>

                <div className="flex items-center justify-between bo-label">
                    <span>{STATUS_LABELS[status.status]}</span>
                    <span>
                        {status.progress_current} /{' '}
                        {status.progress_total || '—'}
                    </span>
                </div>

                <ProgressBar
                    current={status.progress_current}
                    total={status.progress_total}
                />

                {!finished && (
                    <p className="text-sm text-muted-foreground">
                        {createdAt && (
                            <>En curso hace {formatElapsed(elapsedSeconds)}. </>
                        )}
                        Esto puede tardar bastante si el cargador de facturas
                        está insertando contra Tourplan real, fila por fila.
                        Podés cerrar esta pestaña — vas a poder retomarlo desde
                        el{' '}
                        <Link
                            href={InvoiceLoaderHistoryController.index()}
                            className="underline"
                        >
                            Histórico
                        </Link>
                        .
                    </p>
                )}

                {status.status === 'ERROR' && (
                    <p className="text-sm text-destructive">{status.error}</p>
                )}

                {status.status === 'DONE' && (
                    <div className="flex gap-3 pt-4">
                        <Button asChild>
                            <a
                                href={InvoiceExecutionController.report.url({
                                    jobId,
                                })}
                            >
                                Descargar reporte
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                href={InvoiceExecutionController.log.url({
                                    jobId,
                                })}
                            >
                                Descargar log
                            </a>
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
