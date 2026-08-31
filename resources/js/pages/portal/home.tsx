import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { formatDay, lastBusinessDay } from '@/lib/exchange-rates';
import { SECTORS } from '@/lib/portal-sectors';
import { exchangeRate, mesa } from '@/routes/portal';

const RED = '#E30613';

type QuickAccess = {
    num: string;
    title: string;
    href: string;
    icon: ReactNode;
    internal?: boolean;
};

const QUICK_ACCESS: QuickAccess[] = [
    {
        num: '01',
        title: 'Ticketera',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSeyq0O-jjq9FRdLqdL8NeOuDogy0VrRfvspfBXU7-3_AO64rA/viewform',
        icon: (
            <svg
                width="40"
                height="40"
                viewBox="0 0 42 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            >
                <path d="M4 13h34v5a3 3 0 000 6v5H4v-5a3 3 0 000-6z" />
                <line x1="27" y1="13" x2="27" y2="29" strokeDasharray="2 3" />
            </svg>
        ),
    },
    {
        num: '02',
        title: 'Internos',
        href: 'https://docs.google.com/spreadsheets/d/1o5Gsm8oSGapcLPGLmHGpmAZwyK9_49VFLQ_e6tqz_5o/edit',
        icon: (
            <svg
                width="40"
                height="40"
                viewBox="0 0 42 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            >
                <rect x="6" y="8" width="30" height="26" />
                <line x1="6" y1="16" x2="36" y2="16" />
                <line x1="16" y1="8" x2="16" y2="34" />
            </svg>
        ),
    },
    {
        num: '03',
        title: 'Guía telefónica',
        href: 'https://www.appsheet.com/start/9e512a05-852d-4911-aefd-45976c715d0e',
        icon: (
            <svg
                width="40"
                height="40"
                viewBox="0 0 42 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            >
                <rect x="13" y="4" width="16" height="34" rx="3" />
                <line x1="13" y1="31" x2="29" y2="31" />
                <circle
                    cx="21"
                    cy="34.5"
                    r="1.4"
                    fill="currentColor"
                    stroke="none"
                />
            </svg>
        ),
    },
    {
        num: '04',
        title: 'Tipo de Cambio',
        href: exchangeRate().url,
        internal: true,
        icon: (
            <svg
                width="40"
                height="40"
                viewBox="0 0 42 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            >
                <circle cx="21" cy="21" r="15" />
                <text
                    x="21"
                    y="28"
                    textAnchor="middle"
                    fontFamily="Archivo, sans-serif"
                    fontWeight="900"
                    fontSize="19"
                    fill="currentColor"
                    stroke="none"
                >
                    $
                </text>
            </svg>
        ),
    },
    {
        num: '05',
        title: 'Mesa de Información',
        href: mesa().url,
        internal: true,
        icon: (
            <svg
                width="40"
                height="40"
                viewBox="0 0 42 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            >
                <circle cx="21" cy="21" r="15" />
                <line x1="21" y1="19" x2="21" y2="29" />
                <circle
                    cx="21"
                    cy="14"
                    r="1.6"
                    fill="currentColor"
                    stroke="none"
                />
            </svg>
        ),
    },
];

type Clima = {
    city: string;
    temp: string;
    cond: string;
    hi: string;
    lo: string;
};

function SectionHeading({
    label,
    hint,
    compact = false,
}: {
    label: string;
    hint: string;
    compact?: boolean;
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                borderBottom: compact ? '2px solid #000' : '3px solid #000',
                paddingBottom: compact ? '8px' : '10px',
                marginBottom: compact ? '10px' : 0,
            }}
        >
            <div
                style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontWeight: 900,
                    fontSize: compact ? '14px' : '19px',
                    letterSpacing: compact ? '0.02em' : '-0.01em',
                    textTransform: compact ? 'uppercase' : undefined,
                }}
            >
                {label}
                <span style={{ color: RED }}>—</span>
            </div>
            <div
                style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: compact ? '10px' : '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#999',
                }}
            >
                {hint}
            </div>
        </div>
    );
}

function formatArs(value: number): string {
    return Math.round(value).toLocaleString('es-AR');
}

function formatTodayShort(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear() % 100).padStart(2, '0');

    return `${dd}·${mm}·${yy}`;
}

export default function Home() {
    const { canEdit, dolarOficial, iataRate } = usePage().props as unknown as {
        canEdit: boolean;
        dolarOficial: { venta: number; fecha: string | null } | null;
        iataRate: {
            rate: number;
            updatedAt: string | null;
            stale: boolean;
        } | null;
    };
    const [clima, setClima] = useState<Clima[]>([]);

    useEffect(() => {
        fetch('/weather')
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setClima(data);
                }
            })
            .catch(() => {});
    }, []);

    const visibleSectors = SECTORS.filter(
        (sector) =>
            (sector.id !== 'search-admin' || canEdit) &&
            sector.id !== 'exchange-rate',
    );
    const bnaDate = dolarOficial?.fecha
        ? formatDay(new Date(dolarOficial.fecha))
        : formatDay(lastBusinessDay());

    return (
        <>
            <Head title="Portal Eurotur" />

            <section
                data-testid="home-root"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    flex: 1,
                    minHeight: 0,
                    overflow: 'visible',
                }}
            >
                <div>
                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: '#666',
                            marginBottom: '6px',
                        }}
                    >
                        intranet corporativa — hub de accesos
                    </div>
                    <div
                        data-testid="home-hero"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            paddingBottom: '10px',
                            borderBottom: '2px solid #000',
                        }}
                    >
                        <div
                            data-testid="home-hero-top"
                            style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'space-between',
                                gap: '24px',
                            }}
                        >
                            <h1
                                style={{
                                    fontFamily: "'Anton', sans-serif",
                                    fontWeight: 400,
                                    fontSize: 'clamp(36px,4.2vw,52px)',
                                    lineHeight: 0.9,
                                    letterSpacing: '-0.02em',
                                    margin: 0,
                                    textTransform: 'uppercase',
                                }}
                            >
                                Portal de eurotur
                                <span style={{ color: RED }}>.</span>
                            </h1>
                            {clima.length > 0 && (
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        flex: 1,
                                        alignItems: 'flex-end',
                                        paddingBottom: '2px',
                                    }}
                                >
                                    {clima.map((c) => (
                                        <div
                                            key={c.city}
                                            style={{
                                                borderRight: '1px dotted #ccc',
                                                paddingRight: '12px',
                                                ':last-child': {
                                                    borderRight: 'none',
                                                },
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Space Mono', monospace",
                                                    fontSize: '8px',
                                                    letterSpacing: '0.06em',
                                                    textTransform: 'uppercase',
                                                    color: '#888',
                                                }}
                                            >
                                                {c.city}
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Archivo', sans-serif",
                                                    fontWeight: 900,
                                                    fontSize: '18px',
                                                    lineHeight: 1,
                                                    margin: '2px 0 1px',
                                                }}
                                            >
                                                {c.temp}°
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Archivo', sans-serif",
                                                    fontWeight: 600,
                                                    fontSize: '9px',
                                                    color: '#666',
                                                }}
                                            >
                                                {c.cond}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div
                                data-testid="home-dollars"
                                style={{
                                    display: 'flex',
                                    gap: '18px',
                                    textAlign: 'right',
                                    flex: '0 0 auto',
                                    alignItems: 'flex-end',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '8px',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            color: '#999',
                                            textAlign: 'right',
                                        }}
                                    >
                                        dólar iata
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 900,
                                            fontSize: '15px',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {iataRate
                                            ? `$${formatArs(iataRate.rate)}`
                                            : '—'}
                                        <span style={{ color: RED }}>.</span>
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '7px',
                                            color: '#999',
                                            textAlign: 'right',
                                            marginTop: '2px',
                                        }}
                                    >
                                        {iataRate?.updatedAt
                                            ? formatDay(
                                                  new Date(iataRate.updatedAt),
                                              )
                                            : '—'}
                                    </div>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '8px',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            color: '#999',
                                            textAlign: 'right',
                                        }}
                                    >
                                        dólar bna
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 900,
                                            fontSize: '15px',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {dolarOficial
                                            ? `$${formatArs(dolarOficial.venta)}`
                                            : '—'}
                                        <span style={{ color: RED }}>.</span>
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '7px',
                                            color: '#999',
                                            textAlign: 'right',
                                            marginTop: '2px',
                                        }}
                                    >
                                        {bnaDate}
                                    </div>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '8px',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            color: '#999',
                                            textAlign: 'right',
                                        }}
                                    >
                                        hoy
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 900,
                                            fontSize: '15px',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {formatTodayShort()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p
                            style={{
                                margin: 0,
                                maxWidth: '50%',
                                textAlign: 'right',
                                fontFamily: "'Archivo', sans-serif",
                                fontSize: '12px',
                                lineHeight: 1.4,
                                fontWeight: 600,
                                color: '#444',
                                alignSelf: 'flex-end',
                            }}
                        >
                            Todo lo que usás cada día, en un solo lugar.
                        </p>
                    </div>
                </div>

                <div>
                    <SectionHeading
                        label="Accesos rápidos"
                        hint="↗ la mayoría abre en otra pestaña"
                        compact
                    />
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5,1fr)',
                            gap: 0,
                            borderLeft: '1px solid #000',
                        }}
                    >
                        {QUICK_ACCESS.map((q) => {
                            const cardStyle: React.CSSProperties = {
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: '110px',
                                padding: '14px 14px',
                                textDecoration: 'none',
                                color: '#000',
                                borderRight: '1px solid #000',
                                borderBottom: '1px solid #000',
                                transition:
                                    'background .12s,color .12s,transform .14s',
                            };
                            const content = (
                                <>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '11px',
                                            opacity: 0.7,
                                        }}
                                    >
                                        {q.internal ? '→' : '↗'}
                                    </span>
                                    <div>
                                        <div
                                            style={{
                                                fontFamily:
                                                    "'Space Mono', monospace",
                                                fontSize: '10px',
                                                letterSpacing: '0.08em',
                                                color: '#999',
                                            }}
                                        >
                                            {q.num}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily:
                                                    "'Archivo', sans-serif",
                                                fontWeight: 800,
                                                fontSize: '15px',
                                                letterSpacing: '-0.01em',
                                                marginTop: '4px',
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {q.title}
                                        </div>
                                    </div>
                                </>
                            );

                            return q.internal ? (
                                <Link
                                    key={q.num}
                                    href={q.href}
                                    className="quick-card"
                                    style={cardStyle}
                                >
                                    {content}
                                </Link>
                            ) : (
                                <a
                                    key={q.num}
                                    href={q.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="quick-card"
                                    style={cardStyle}
                                >
                                    {content}
                                </a>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <SectionHeading
                        label="Sectores"
                        hint="→ tocá para entrar"
                        compact
                    />
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(210px, 1fr))',
                            gap: 0,
                            borderLeft: '1px solid #000',
                            gridAutoRows: '1fr',
                        }}
                    >
                        {visibleSectors.map((sector) => (
                            <Link
                                key={sector.id}
                                href={sector.href}
                                className="tile"
                                style={{
                                    cursor: 'pointer',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '135px',
                                    padding: '14px',
                                    textDecoration: 'none',
                                    color: '#fff',
                                    backgroundColor: '#111',
                                    borderRight: '1px solid #000',
                                    borderBottom: '1px solid #000',
                                    ['--tile-photo' as string]: `url('/img/portal/sectores/${sector.id}.webp')`,
                                    transition:
                                        'background .12s,color .12s,transform .14s',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '9px',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            opacity: 0.85,
                                        }}
                                    >
                                        {sector.place}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'space-between',
                                        gap: '8px',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 800,
                                            fontSize: 'clamp(20px,3vw,32px)',
                                            letterSpacing: '-0.01em',
                                            lineHeight: 1.05,
                                        }}
                                    >
                                        {sector.shortLabel}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '15px',
                                            flex: '0 0 auto',
                                            lineHeight: 1,
                                        }}
                                    >
                                        →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

Home.layout = { active: 'home', label: 'Inicio—' };
