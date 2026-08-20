import { Form, Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import BnaDailyRateController from '@/actions/App/Http/Controllers/Portal/BnaDailyRateController';
import InputError from '@/components/input-error';

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
    bnaSell: number | null;
    history: HistoryRow[];
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
    value,
    stale,
    updatedAt,
}: {
    label: string;
    source: string;
    value: number | null;
    stale?: boolean;
    updatedAt?: string | null;
}) {
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
                    fuente: {source}
                    {updatedAt
                        ? ` · actualizado ${new Date(updatedAt).toLocaleString('es-AR')}`
                        : ''}
                </span>
                {stale && (
                    <span
                        style={{
                            background: RED,
                            color: '#fff',
                            padding: '2px 6px',
                        }}
                    >
                        en caché
                    </span>
                )}
            </div>
        </div>
    );
}

export default function ExchangeRate({ bnaSell, history }: Props) {
    const { auth, iataRate } = usePage().props;
    const isAuthenticated = Boolean(auth.user);
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

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
                        value={iataRate?.rate ?? null}
                        stale={iataRate?.stale}
                        updatedAt={iataRate?.updatedAt}
                    />
                    <RateBlock
                        label="BNA — hoy"
                        source="dolarapi.com · venta"
                        value={bnaSell}
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
                        {history.map((row) =>
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
                                        {isAuthenticated && (
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

                {isAuthenticated && (
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
