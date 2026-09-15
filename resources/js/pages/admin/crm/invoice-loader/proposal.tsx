import { Head, Link, router, usePoll } from '@inertiajs/react';
import type { Workbook } from 'exceljs';
import { useCallback, useEffect, useRef, useState } from 'react';
import InvoiceExecutionController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceExecutionController';
import InvoiceLoaderHistoryController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceLoaderHistoryController';
import InvoiceProposalController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceProposalController';
import { InvoiceLoaderProposalTable } from '@/components/backoffice/invoice-loader-proposal-table';
import { PageHeader } from '@/components/backoffice/page-header';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatElapsed } from '@/lib/invoice-loader/format-elapsed';
import type { ProposalRow } from '@/lib/invoice-loader/proposal-workbook';

type JobStatus = {
    job_id: string;
    kind: 'proposal';
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

/** ExcelJS pesa ~1 MB: sólo se descarga cuando la propuesta ya está lista. */
async function cargarHerramientasExcel() {
    const [ExcelJS, workbookLib] = await Promise.all([
        import('exceljs'),
        import('@/lib/invoice-loader/proposal-workbook'),
    ]);

    return { ExcelJS: ExcelJS.default ?? ExcelJS, ...workbookLib };
}

type ParseState = 'idle' | 'loading' | 'loaded' | 'error';

export default function InvoiceLoaderProposal({
    jobId,
    status,
    createdAt,
}: {
    jobId: string;
    status: JobStatus;
    createdAt: string | null;
}) {
    const finished = status.status === 'DONE' || status.status === 'ERROR';
    const { stop } = usePoll(2000, { only: ['status'] });
    const [dryRun, setDryRun] = useState('1');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const loadStarted = useRef(false);
    const [parseState, setParseState] = useState<ParseState>('idle');
    const [parseError, setParseError] = useState<string | null>(null);
    const [workbook, setWorkbook] = useState<Workbook | null>(null);
    const [rows, setRows] = useState<ProposalRow[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [submitErrors, setSubmitErrors] = useState<Record<string, string>>(
        {},
    );

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

    const cargarPropuesta = useCallback(async () => {
        setParseState('loading');
        setParseError(null);

        try {
            const response = await fetch(
                InvoiceProposalController.download.url({ jobId }),
            );

            if (!response.ok) {
                throw new Error(
                    'No se pudo descargar la propuesta desde el cargador de facturas.',
                );
            }

            const buffer = await response.arrayBuffer();
            const { ExcelJS, readProposalRows } =
                await cargarHerramientasExcel();
            const wb = new ExcelJS.Workbook();
            await wb.xlsx.load(buffer);

            setWorkbook(wb);
            setRows(readProposalRows(wb));
            setParseState('loaded');
        } catch (e) {
            setParseError(
                e instanceof Error
                    ? e.message
                    : 'No se pudo leer el Excel de la propuesta.',
            );
            setParseState('error');
        }
    }, [jobId]);

    useEffect(() => {
        if (status.status !== 'DONE' || loadStarted.current) {
            return;
        }

        loadStarted.current = true;
        void cargarPropuesta();
    }, [status.status, cargarPropuesta]);

    function updateRow(rowNumber: number, patch: Partial<ProposalRow>) {
        setRows((prev) =>
            prev.map((row) =>
                row._rowNumber === rowNumber ? { ...row, ...patch } : row,
            ),
        );
    }

    async function ejecutar() {
        if (!workbook) {
            return;
        }

        setSubmitting(true);
        setSubmitErrors({});

        try {
            const { applyApprovals } = await cargarHerramientasExcel();
            applyApprovals(workbook, rows);
            const buffer = await workbook.xlsx.writeBuffer();
            const file = new File([buffer], 'propuesta_completada.xlsx', {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            router.post(
                InvoiceExecutionController.store.url(),
                { file, dry_run: dryRun },
                {
                    forceFormData: true,
                    onError: (errors) => setSubmitErrors(errors),
                    onFinish: () => setSubmitting(false),
                },
            );
        } catch (e) {
            setSubmitErrors({
                file:
                    e instanceof Error
                        ? e.message
                        : 'No se pudo armar el Excel a enviar.',
            });
            setSubmitting(false);
        }
    }

    return (
        <>
            <Head title="Cargador de Facturas — Propuesta" />

            <PageHeader
                eyebrow="Herramientas / Cargador de Facturas"
                title="Propuesta"
                description={`Job ${jobId}`}
            />

            <div className="mt-6 space-y-4">
                <div className="max-w-xl space-y-4">
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
                                <>
                                    En curso hace{' '}
                                    {formatElapsed(elapsedSeconds)}.{' '}
                                </>
                            )}
                            Esto puede tardar bastante si el cargador de
                            facturas está validando contra Tourplan real, fila
                            por fila. Podés cerrar esta pestaña — vas a poder
                            retomarlo desde el{' '}
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
                        <p className="text-sm text-destructive">
                            {status.error}
                        </p>
                    )}
                </div>

                {status.status === 'DONE' && (
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" asChild>
                                <a
                                    href={InvoiceProposalController.download.url(
                                        { jobId },
                                    )}
                                >
                                    Descargar copia (Excel)
                                </a>
                            </Button>

                            {parseState === 'loading' && (
                                <span className="bo-label text-muted-foreground">
                                    Leyendo la propuesta…
                                </span>
                            )}
                        </div>

                        {parseState === 'error' && (
                            <div className="space-y-2">
                                <p className="text-sm text-destructive">
                                    {parseError}
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => void cargarPropuesta()}
                                >
                                    Reintentar
                                </Button>
                            </div>
                        )}

                        {parseState === 'loaded' && (
                            <div className="space-y-6">
                                <InvoiceLoaderProposalTable
                                    rows={rows}
                                    onChange={updateRow}
                                />

                                <div className="border-t border-border pt-6">
                                    <h2 className="mb-3 text-[15px] font-bold">
                                        Ejecutar
                                    </h2>

                                    <div className="flex flex-wrap items-end gap-4">
                                        <div className="grid max-w-sm gap-1">
                                            <Select
                                                value={dryRun}
                                                onValueChange={setDryRun}
                                            >
                                                <SelectTrigger className="w-64 rounded-none">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        Simulación — no escribe
                                                        en Tourplan
                                                    </SelectItem>
                                                    <SelectItem value="0">
                                                        Carga real — inserta en
                                                        Tourplan
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={submitErrors.dry_run}
                                            />
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={() => void ejecutar()}
                                            disabled={submitting}
                                        >
                                            Ejecutar
                                        </Button>
                                    </div>
                                    <InputError message={submitErrors.file} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
