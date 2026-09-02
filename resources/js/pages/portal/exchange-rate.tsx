import { Form, Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import BnaDailyRateController from '@/actions/App/Http/Controllers/Portal/BnaDailyRateController';
import BnaDailyRateExportController from '@/actions/App/Http/Controllers/Portal/BnaDailyRateExportController';
import InputError from '@/components/input-error';
import {
    formatDay,
    formatTimestamp,
    isRateStale,
    lastBusinessDay,
} from '@/lib/exchange-rates';
import type { ExchangeRate } from '@/lib/exchange-rates';
import { exchangeRate } from '@/routes/portal';

const RED = '#E30613';

function formatArs(value: number): string {
    return value.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

type HistoryRow = {
    id: number;
    date: string;
    dateLabel: string;
    cashBuy: number | null;
    cashSell: number;
    note: string | null;
};

type Props = {
    bna: ExchangeRate | null;
    history: HistoryRow[];
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        date_from: string | null;
        date_to: string | null;
    };
};

const labelFieldStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: "'Archivo', sans-serif",
    fontSize: '12.5px',
    fontWeight: 500,
    border: 'none',
    borderBottom: '1px solid #000',
    borderRadius: 0,
    padding: '4px 0',
    marginBottom: '6px',
};

const smallButtonStyle: React.CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: 'transparent',
    border: '1px solid #000',
    padding: '4px 8px',
    cursor: 'pointer',
};

function RateBlock({
    label,
    source,
    sourceHref,
    value,
    stale,
    updatedAt,
}: {
    label: string;
    source: string;
    sourceHref?: string;
    value: number | null;
    stale?: boolean;
    updatedAt?: string | null;
}) {
    const date = updatedAt ? formatTimestamp(updatedAt) : '';

    return (
        <div
            style={{
                borderRight: '1px solid #000',
                padding: '14px 18px 16px 18px',
            }}
        >
            <div
                style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#666',
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontWeight: 900,
                    fontSize: '48px',
                    lineHeight: 0.9,
                    marginTop: '8px',
                }}
            >
                {value !== null ? `$ ${formatArs(value)}` : '—'}
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '10px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '9px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#999',
                }}
            >
                <span>
                    fuente:{' '}
                    {sourceHref ? (
                        <a
                            href={sourceHref}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                color: 'inherit',
                                textDecoration: 'underline',
                            }}
                        >
                            {source}
                        </a>
                    ) : (
                        source
                    )}
                    {date ? ` · actualizado ${date}` : ''}
                </span>
                {stale && (
                    <span
                        style={{
                            background: RED,
                            color: '#fff',
                            padding: '2px 6px',
                        }}
                    >
                        desactualizado
                    </span>
                )}
            </div>
            {stale && (
                <div
                    style={{
                        marginTop: '10px',
                        border: `2px solid ${RED}`,
                        padding: '8px 10px',
                        fontFamily: "'Archivo', sans-serif",
                        fontWeight: 700,
                        fontSize: '12px',
                        color: RED,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}
                >
                    ⚠ dato del{' '}
                    {date ? formatDay(new Date(updatedAt as string)) : '—'} — la
                    fuente no actualizó desde hace más de un día hábil
                </div>
            )}
        </div>
    );
}

export default function ExchangeRate({
    bna,
    history,
    pagination,
    filters,
}: Props) {
    const { auth, canEdit: canEditProp, iataRate } = usePage().props;
    const canEdit = Boolean(auth.user) && canEditProp;
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [filter, setFilter] = useState('');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const needle = filter.trim().toLowerCase();
    const visibleHistory =
        needle === ''
            ? history
            : history.filter((row) =>
                  [row.dateLabel, row.note ?? '']
                      .join(' ')
                      .toLowerCase()
                      .includes(needle),
              );

    function applyFilters(overrides: Record<string, string | null> = {}) {
        const params: Record<string, string> = {};
        if (overrides.date_from !== undefined && overrides.date_from !== null) {
            params.date_from = overrides.date_from;
        } else if (dateFrom) {
            params.date_from = dateFrom;
        }
        if (overrides.date_to !== undefined && overrides.date_to !== null) {
            params.date_to = overrides.date_to;
        } else if (dateTo) {
            params.date_to = dateTo;
        }
        router.get(exchangeRate.url({ query: params }), {}, {
            preserveState: true,
            replace: true,
        });
    }

    function goToPage(page: number) {
        const params: Record<string, string | number> = { page };
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        router.get(exchangeRate.url({ query: params }), {}, {
            preserveState: true,
            replace: true,
        });
    }

    function exportCsv() {
        const params = new URLSearchParams();
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        window.location.href = BnaDailyRateExportController.url({
            query: Object.fromEntries(params),
        });
    }

    const bnaDate = bna?.fecha ? new Date(bna.fecha) : lastBusinessDay();
    const bnaLabel = `BNA — ${formatDay(bnaDate)}`;
    const bnaStale = isRateStale(bna?.fecha ?? null);

    return (
        <>
            <Head title="Tipo de Cambio" />

            <section>
                <div style={{ maxWidth: '600px', marginBottom: '26px' }}>
                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: '#666',
                            marginBottom: '12px',
                        }}
                    >
                        cotización — iata · bna · histórico
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Anton', sans-serif",
                            fontWeight: 400,
                            fontSize: 'clamp(56px,8vw,110px)',
                            lineHeight: 0.86,
                            margin: 0,
                            letterSpacing: '-0.005em',
                        }}
                    >
                        Tipo de Cambio
                        <span style={{ color: RED }}>.</span>
                    </h1>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2,1fr)',
                        borderTop: '3px solid #000',
                        borderBottom: '1px solid #000',
                        borderLeft: '1px solid #000',
                    }}
                >
                    <RateBlock
                        label="IATA — Dólar Aéreo"
                        source="sudameria.com"
                        sourceHref="https://sudameria.com/"
                        value={iataRate?.rate ?? null}
                        stale={
                            iataRate?.stale ||
                            isRateStale(iataRate?.updatedAt ?? null)
                        }
                        updatedAt={iataRate?.updatedAt}
                    />
                    <RateBlock
                        label={bnaLabel}
                        source="bna.com.ar"
                        sourceHref="https://www.bna.com.ar/Personas"
                        value={bna?.venta ?? null}
                        stale={bnaStale}
                        updatedAt={bna?.fecha}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        borderBottom: '3px solid #000',
                        paddingBottom: '10px',
                        margin: '38px 0 0',
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '19px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Histórico BNA billetes
                        <span style={{ color: RED }}>—</span>
                    </div>
                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#999',
                        }}
                    >
                        actualización diaria — lun a vie
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        marginTop: '18px',
                        flexWrap: 'wrap',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap',
                            flex: 1,
                        }}
                    >
                        <input
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Filtrar (fecha o nota)…"
                            style={{
                                maxWidth: '220px',
                                fontFamily: "'Archivo', sans-serif",
                                fontSize: '13px',
                                border: 'none',
                                borderBottom: '2px solid #000',
                                borderRadius: 0,
                                padding: '6px 0',
                            }}
                        />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            placeholder="Desde"
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontSize: '13px',
                                border: 'none',
                                borderBottom: '2px solid #000',
                                borderRadius: 0,
                                padding: '6px 0',
                                width: '150px',
                            }}
                        />
                        <span
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '10px',
                                color: '#999',
                            }}
                        >
                            a
                        </span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            placeholder="Hasta"
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontSize: '13px',
                                border: 'none',
                                borderBottom: '2px solid #000',
                                borderRadius: 0,
                                padding: '6px 0',
                                width: '150px',
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => applyFilters()}
                            style={smallButtonStyle}
                        >
                            Filtrar
                        </button>
                        {(dateFrom || dateTo) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setDateFrom('');
                                    setDateTo('');
                                    applyFilters({
                                        date_from: '',
                                        date_to: '',
                                    });
                                }}
                                style={{
                                    ...smallButtonStyle,
                                    color: '#666',
                                }}
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={exportCsv}
                        style={smallButtonStyle}
                    >
                        Exportar CSV ↓
                    </button>
                </div>

                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: '18px',
                        fontSize: '13px',
                    }}
                >
                    <thead>
                        <tr style={{ borderBottom: '2px solid #000' }}>
                            {['Fecha', 'Compra', 'Venta', 'Nota', ''].map(
                                (h) => (
                                    <th
                                        key={h}
                                        style={{
                                            textAlign: 'left',
                                            padding: '6px 10px',
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '10px',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            color: '#666',
                                        }}
                                    >
                                        {h}
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleHistory.map((row) =>
                            editingId === row.id ? (
                                <tr key={row.id}>
                                    <td colSpan={5} style={{ padding: '10px' }}>
                                        <RateForm
                                            row={row}
                                            onDone={() => setEditingId(null)}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                <tr
                                    key={row.id}
                                    style={{
                                        borderBottom: '1px dotted #cfcfcf',
                                    }}
                                >
                                    <td
                                        style={{
                                            padding: '8px 10px',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {row.dateLabel}
                                    </td>
                                    <td style={{ padding: '8px 10px' }}>
                                        {row.cashBuy !== null
                                            ? `$ ${formatArs(row.cashBuy)}`
                                            : '—'}
                                    </td>
                                    <td
                                        style={{ padding: '8px 10px' }}
                                    >{`$ ${formatArs(row.cashSell)}`}</td>
                                    <td
                                        style={{
                                            padding: '8px 10px',
                                            color: '#777',
                                        }}
                                    >
                                        {row.note ?? '—'}
                                    </td>
                                    <td
                                        style={{
                                            padding: '8px 10px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {canEdit && (
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditingId(row.id)
                                                    }
                                                    title="Editar"
                                                    style={{
                                                        all: 'unset',
                                                        cursor: 'pointer',
                                                        fontFamily:
                                                            "'Space Mono', monospace",
                                                        fontSize: '11px',
                                                        color: '#666',
                                                    }}
                                                >
                                                    ✎
                                                </button>
                                                <Form
                                                    {...BnaDailyRateController.destroy.form(
                                                        { rate: row.id },
                                                    )}
                                                >
                                                    {({ processing }) => (
                                                        <button
                                                            type="submit"
                                                            disabled={
                                                                processing
                                                            }
                                                            title="Eliminar"
                                                            style={{
                                                                all: 'unset',
                                                                cursor: 'pointer',
                                                                fontFamily:
                                                                    "'Space Mono', monospace",
                                                                fontSize:
                                                                    '11px',
                                                                color: RED,
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </Form>
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ),
                        )}
                    </tbody>
                </table>

                {pagination.last_page > 1 && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '16px',
                            marginTop: '20px',
                            paddingBottom: '10px',
                        }}
                    >
                        <button
                            type="button"
                            disabled={pagination.current_page <= 1}
                            onClick={() => goToPage(pagination.current_page - 1)}
                            style={{
                                ...smallButtonStyle,
                                opacity: pagination.current_page <= 1 ? 0.4 : 1,
                                cursor:
                                    pagination.current_page <= 1
                                        ? 'default'
                                        : 'pointer',
                            }}
                        >
                            ← Anterior
                        </button>
                        <span
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '11px',
                                color: '#666',
                            }}
                        >
                            Página {pagination.current_page} de{' '}
                            {pagination.last_page}
                            <span
                                style={{
                                    marginLeft: '8px',
                                    color: '#999',
                                    fontSize: '10px',
                                }}
                            >
                                ({pagination.total} registros)
                            </span>
                        </span>
                        <button
                            type="button"
                            disabled={
                                pagination.current_page >= pagination.last_page
                            }
                            onClick={() => goToPage(pagination.current_page + 1)}
                            style={{
                                ...smallButtonStyle,
                                opacity:
                                    pagination.current_page >= pagination.last_page
                                        ? 0.4
                                        : 1,
                                cursor:
                                    pagination.current_page >= pagination.last_page
                                        ? 'default'
                                        : 'pointer',
                            }}
                        >
                            Siguiente →
                        </button>
                    </div>
                )}

                {canEdit && (
                    <div style={{ paddingTop: '14px' }}>
                        {adding ? (
                            <RateForm onDone={() => setAdding(false)} />
                        ) : (
                            <button
                                type="button"
                                onClick={() => setAdding(true)}
                                style={smallButtonStyle}
                            >
                                + agregar día
                            </button>
                        )}
                    </div>
                )}
            </section>
        </>
    );
}

function RateForm({
    row,
    onDone,
}: {
    row?: HistoryRow;
    onDone: () => void;
}): ReactNode {
    const action = row
        ? BnaDailyRateController.update.form({ rate: row.id })
        : BnaDailyRateController.store.form();

    return (
        <Form
            {...action}
            onSuccess={onDone}
            className="flex flex-wrap items-end gap-3"
        >
            {({ processing, errors }) => (
                <>
                    <div style={{ minWidth: '130px' }}>
                        <input
                            type="date"
                            name="date"
                            defaultValue={row?.date}
                            required
                            style={labelFieldStyle}
                        />
                        <InputError message={errors.date} />
                    </div>
                    <div style={{ minWidth: '110px' }}>
                        <input
                            type="number"
                            step="0.01"
                            name="cash_buy"
                            placeholder="Compra"
                            defaultValue={row?.cashBuy ?? ''}
                            style={labelFieldStyle}
                        />
                        <InputError message={errors.cash_buy} />
                    </div>
                    <div style={{ minWidth: '110px' }}>
                        <input
                            type="number"
                            step="0.01"
                            name="cash_sell"
                            placeholder="Venta"
                            defaultValue={row?.cashSell}
                            required
                            style={labelFieldStyle}
                        />
                        <InputError message={errors.cash_sell} />
                    </div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <input
                            name="note"
                            placeholder="Nota (opcional)"
                            defaultValue={row?.note ?? ''}
                            style={labelFieldStyle}
                        />
                        <InputError message={errors.note} />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        style={smallButtonStyle}
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        onClick={onDone}
                        style={smallButtonStyle}
                    >
                        Cancelar
                    </button>
                </>
            )}
        </Form>
    );
}

ExchangeRate.layout = { active: 'exchange-rate', label: 'Tipo de Cambio—' };
