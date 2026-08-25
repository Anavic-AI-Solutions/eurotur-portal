import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { ImageSlot } from '@/components/portal/image-slot';
import { SECTORS } from '@/lib/portal-sectors';
import { exchangeRate, mesa } from '@/routes/portal';

const RED = '#E30613';
const SHOW_CLIMA = true;

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

const CLIMA: Clima[] = [
    {
        city: 'Buenos Aires',
        temp: '13',
        cond: 'Parcial nublado',
        hi: '16',
        lo: '9',
    },
    { city: 'El Calafate', temp: '2', cond: 'Nieve ligera', hi: '5', lo: '-3' },
    { city: 'Ushuaia', temp: '-1', cond: 'Nublado', hi: '3', lo: '-4' },
    { city: 'Salta', temp: '17', cond: 'Despejado', hi: '24', lo: '8' },
];

function SectionHeading({ label, hint }: { label: string; hint: string }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                borderBottom: '3px solid #000',
                paddingBottom: '10px',
                marginBottom: 0,
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
                {label}
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
                {hint}
            </div>
        </div>
    );
}

export default function Home() {
    const { canEdit } = usePage().props;
    const visibleSectors = SECTORS.filter(
        (sector) => sector.id !== 'search-admin' || canEdit,
    );

    return (
        <>
            <Head title="Portal Eurotur" />

            <section
                data-testid="home-root"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
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
                            marginBottom: '14px',
                        }}
                    >
                        intranet corporativa — hub de accesos
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Anton', sans-serif",
                            fontWeight: 400,
                            fontSize: 'clamp(64px,9vw,132px)',
                            lineHeight: 0.82,
                            letterSpacing: '-0.005em',
                            margin: 0,
                        }}
                    >
                        Portal de
                        <br />
                        eurotur
                        <span style={{ color: RED }}>.</span>
                    </h1>
                    <p
                        style={{
                            maxWidth: '560px',
                            margin: '20px 0 0',
                            fontSize: '16px',
                            lineHeight: 1.45,
                            fontWeight: 600,
                            color: '#111',
                        }}
                    >
                        Todo lo que usás cada día, a un toque. Elegí un acceso
                        rápido o entrá a tu sector.
                    </p>
                    <div
                        style={{
                            position: 'relative',
                            marginTop: '26px',
                            overflow: 'hidden',
                        }}
                    >
                        <ImageSlot
                            src="/img/portal/portada.jpg"
                            alt="Portada Eurotur"
                            placeholder="Imagen de portada — arquitectura / Patagonia (blanco y negro, a sangre)"
                            contain
                        />
                    </div>
                </div>

                <div>
                    <SectionHeading
                        label="Accesos rápidos"
                        hint="↗ la mayoría abre en otra pestaña"
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
                                minHeight: '170px',
                                padding: '18px',
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
                                            top: '16px',
                                            right: '16px',
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '13px',
                                        }}
                                    >
                                        {q.internal ? '→' : '↗'}
                                    </span>
                                    {q.icon}
                                    <div>
                                        <div
                                            style={{
                                                fontFamily:
                                                    "'Space Mono', monospace",
                                                fontSize: '10px',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            {q.num}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily:
                                                    "'Archivo', sans-serif",
                                                fontWeight: 800,
                                                fontSize: '17px',
                                                letterSpacing: '-0.01em',
                                                marginTop: '2px',
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
                    />
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4,1fr)',
                            gap: 0,
                            borderLeft: '1px solid #000',
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
                                    minHeight: '172px',
                                    padding: '16px',
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

                {SHOW_CLIMA && (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                borderBottom: '3px solid #000',
                                paddingBottom: '10px',
                                marginBottom: '22px',
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
                                Clima
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
                                pronóstico oficinas
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4,1fr)',
                                columnGap: 0,
                            }}
                        >
                            {CLIMA.map((c) => (
                                <div
                                    key={c.city}
                                    style={{
                                        padding: '2px 22px 2px 0',
                                        borderRight: '1px dotted #000',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '10px',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            color: '#666',
                                        }}
                                    >
                                        {c.city}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 900,
                                            fontSize: '56px',
                                            lineHeight: 0.85,
                                            margin: '8px 0 6px',
                                        }}
                                    >
                                        {c.temp}
                                        <span
                                            style={{
                                                fontSize: '24px',
                                                verticalAlign: 'top',
                                            }}
                                        >
                                            °
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 600,
                                            fontSize: '13px',
                                        }}
                                    >
                                        {c.cond}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '10px',
                                            letterSpacing: '0.06em',
                                            color: '#999',
                                            marginTop: '6px',
                                        }}
                                    >
                                        máx {c.hi}° · mín {c.lo}°
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}

Home.layout = { active: 'home', label: 'Inicio—' };
