import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { formatDay, isRateStale, lastBusinessDay } from '@/lib/exchange-rates';
import { SECTORS } from '@/lib/portal-sectors';
import type { ActiveView } from '@/lib/portal-sectors';
import { home, logout } from '@/routes';
import { search, searchResults } from '@/routes/portal';

const RED = '#E30613';
const STRIPE_ACCENT = true;

function formatToday(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear() % 100).padStart(2, '0');

    return `${dd}·${mm}·${yy}`;
}

function formatArs(value: number): string {
    return Math.round(value).toLocaleString('es-AR');
}

export default function PortalLayout({
    active = 'home',
    label = 'Inicio—',
    children,
}: {
    active?: ActiveView;
    label?: string;
    children: ReactNode;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { dolarOficial, iataRate } = usePage().props;

    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"
                />
            </Head>

            <style>{`
                .eurotur-portal ::selection { background: ${RED}; color: #fff; }
                .eurotur-portal .nav-item:hover { background: ${RED}; color: #fff; transform: translateX(5px); }
                .eurotur-portal .logout-btn:hover { background: ${RED}; color: #fff; transform: translateX(5px); }
                .eurotur-portal .quick-card:hover { background: ${RED}; color: #fff; transform: translateY(-5px); }
                .eurotur-portal .tile { background-image: linear-gradient(rgba(0,0,0,.42),rgba(0,0,0,.42)),var(--tile-photo); background-size: cover; background-position: center; }
                .eurotur-portal .tile:hover { background-image: linear-gradient(rgba(227,6,19,.55),rgba(227,6,19,.55)),var(--tile-photo); color: #fff; transform: translateY(-5px); }
                .eurotur-portal .doc-link:hover { color: ${RED}; border-color: ${RED}; transform: translateX(3px); }
                .eurotur-portal .search-result:hover { background: ${RED}; color: #fff; }
                .eurotur-portal .search-result:hover div { color: #fff !important; }
                .eurotur-portal .search-result-active { background: ${RED}; color: #fff; }
                .eurotur-portal .search-result-active div { color: #fff !important; }
                .eurotur-portal .qrated-cta:hover { background: #b3050f; transform: translateY(-3px); }
                .eurotur-portal .qrated-cat { color: #000; }
                .eurotur-portal .qrated-cat-num { color: #999; }
                .eurotur-portal .qrated-cat-desc { color: #777; }
                .eurotur-portal .qrated-cat:hover { background: ${RED}; color: #fff; transform: translateY(-5px); }
                .eurotur-portal .qrated-cat:hover .qrated-cat-num,
                .eurotur-portal .qrated-cat:hover .qrated-cat-desc { color: rgba(255,255,255,.85); }
                .eurotur-portal .mesa-cred-btn:hover { background: #000; color: #fff; }
                .eurotur-portal .mesa-copy-btn:hover { background: ${RED}; color: #fff; border-color: ${RED}; }
                .eurotur-portal .innov-frente-header:hover { background: #faf7f7; transform: translateX(4px); }
                .eurotur-portal .innov-mosaic-item:hover { border-color: #000; transform: translateY(-3px); }
                .eurotur-portal .innov-instr-card:hover { background: #faf7f7; }
                .eurotur-portal .innov-instr-link:hover { background: #b3050f; transform: translateX(3px); }

                @media (max-width: 860px) {
                    #portal-root { flex-direction: column; }
                    #portal-aside { width: 100% !important; flex: none !important; position: sticky !important; top: 0 !important; height: auto !important; align-self: auto !important; z-index: 40; background: #fff; border-right: none !important; border-bottom: 1px solid #000; padding: 14px 18px !important; }
                    #portal-asidetop { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
                    #portal-burger { display: flex !important; }
                    #portal-nav { display: none !important; }
                    #portal-aside[data-menu="open"] #portal-nav { display: flex !important; margin-top: 14px; }
                    #portal-divider { display: none; }
                    #portal-aside[data-menu="open"] #portal-divider { display: block; margin: 14px 0 0 !important; }
                    #portal-asidefoot { display: none; }
                    #portal-aside[data-menu="open"] #portal-asidefoot { display: block; }
                    #portal-vlabel { display: none !important; }
                    #portal-header { flex-direction: column; align-items: flex-start !important; gap: 18px !important; padding: 22px 20px 18px !important; }
                    #portal-header > div { max-width: none !important; width: 100%; }
                    #portal-content { padding: 26px 20px 32px !important; }
                    #portal-footer { flex-direction: column; align-items: flex-start !important; gap: 16px !important; padding: 20px !important; }
                    #portal-footer > div { flex-wrap: wrap; gap: 10px 22px !important; }
                }
                @media (max-width: 900px) {
                    #portal-content [style*="repeat(5"] { grid-template-columns: repeat(3,1fr) !important; }
                    #portal-content [style*="repeat(4"] { grid-template-columns: repeat(3,1fr) !important; }
                    #portal-content [style*="1.55fr 1fr"] { grid-template-columns: 1fr !important; }
                    #portal-content [style*="0.82fr 1.18fr"] { grid-template-columns: 1fr !important; }
                    #portal-content [style*="1.08fr 0.92fr"] { grid-template-columns: 1fr !important; }
                    #portal-root[data-page="home"] [data-testid="home-hero"] h1 { font-size: clamp(20px, 3.2vw, 26px) !important; }
                }
                @media (max-width: 600px) {
                    #portal-content [style*="repeat(5"],
                    #portal-content [style*="repeat(4"],
                    #portal-content [style*="repeat(3"] { grid-template-columns: repeat(2,1fr) !important; }
                    #portal-content [style*="repeat(2"] { grid-template-columns: 1fr !important; }
                    #portal-content [style*="gap:18px"] { flex-wrap: wrap; row-gap: 8px !important; }
                    #portal-content #qrated-cats { grid-template-columns: 1fr !important; }
                    #portal-root[data-page="home"] [data-testid="home-hero"] { gap: 6px !important; }
                    #portal-root[data-page="home"] [data-testid="home-hero"] p { max-width: 100% !important; text-align: left !important; align-self: flex-start !important; }
                    #portal-root[data-page="home"] [data-testid="home-hero"] h1 { font-size: clamp(18px, 5vw, 22px) !important; }
                    #portal-root[data-page="home"] [data-testid="home-hero-top"] { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
                    #portal-root[data-page="home"] [data-testid="home-dollars"] { flex-wrap: wrap !important; }
                }
                @media (max-height: 750px) {
                    #portal-root[data-page="home"] #portal-content { padding-top: 12px !important; padding-bottom: 8px !important; }
                    #portal-root[data-page="home"] [data-testid="home-root"] { gap: 4px !important; }
                }
            `}</style>

            <div
                id="portal-root"
                className="eurotur-portal"
                data-page={active}
                style={{
                    display: 'flex',
                    height: '100vh',
                    overflow: 'hidden',
                    background: '#fff',
                    color: '#000',
                    fontFamily: "'Archivo', sans-serif",
                }}
            >
                <Sidebar
                    active={active}
                    menuOpen={menuOpen}
                    onToggleMenu={() => setMenuOpen((v) => !v)}
                    isHome={active === 'home'}
                />

                <main
                    style={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 0,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Header
                        dolarOficial={dolarOficial}
                        iataRate={iataRate}
                        isHome={active === 'home'}
                    />

                    {STRIPE_ACCENT && (
                        <div
                            style={{
                                height: '22px',
                                backgroundImage:
                                    'repeating-linear-gradient(90deg,#000 0 3px,#fff 3px 9px)',
                                borderBottom: '1px solid #000',
                            }}
                        />
                    )}

                    <div
                        id="portal-vlabel"
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: '150px',
                            bottom: '120px',
                            width: '112px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                            paddingTop: '16px',
                        }}
                    >
                        <div
                            style={{
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                fontFamily: "'Anton', sans-serif",
                                fontSize: '56px',
                                lineHeight: 0.9,
                                color: RED,
                                letterSpacing: '0.01em',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {label}
                        </div>
                    </div>

                    <div
                        id="portal-content"
                        style={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            padding:
                                active === 'home'
                                    ? '20px 28px 16px 112px'
                                    : '44px 56px 40px 112px',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {children}
                    </div>

                    <Footer />
                </main>
            </div>
        </>
    );
}

function Sidebar({
    active,
    menuOpen,
    onToggleMenu,
    isHome,
}: {
    active: ActiveView;
    menuOpen: boolean;
    onToggleMenu: () => void;
    isHome?: boolean;
}) {
    const { auth, canEdit } = usePage().props;
    const isAuthenticated = Boolean(auth.user);
    const visibleSectors = SECTORS.filter(
        (sector) => sector.id !== 'search-admin' || canEdit,
    );

    return (
        <aside
            id="portal-aside"
            data-menu={menuOpen ? 'open' : 'closed'}
            style={{
                width: '216px',
                flex: '0 0 216px',
                position: 'sticky',
                top: 0,
                alignSelf: 'flex-start',
                height: '100vh',
                padding: '34px 22px 28px',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #000',
            }}
        >
            <div id="portal-asidetop">
                <Link
                    href={home()}
                    style={{
                        all: 'unset',
                        cursor: 'pointer',
                        display: 'block',
                    }}
                >
                    <img
                        src="/eurotur-logo.png"
                        alt="Eurotur — 70 años"
                        style={{
                            width: '118px',
                            height: 'auto',
                            display: 'block',
                        }}
                    />
                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '9px',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: '#666',
                            marginTop: '10px',
                        }}
                    >
                        portal interno
                        <br />
                        dmc · desde 1954
                    </div>
                </Link>
                <button
                    id="portal-burger"
                    type="button"
                    onClick={onToggleMenu}
                    style={{
                        display: 'none',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        background: '#000',
                        color: '#fff',
                        border: 'none',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        padding: '11px 14px',
                    }}
                >
                    {menuOpen ? 'Cerrar ✕' : 'Menú ≡'}
                </button>
            </div>

            <div
                id="portal-divider"
                style={{
                    height: '1px',
                    background: '#000',
                    margin: '24px 0 20px',
                }}
            />

            <nav
                id="portal-nav"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    flex: 1,
                }}
            >
                {visibleSectors.map((sector) => (
                    <Link
                        key={sector.id}
                        href={sector.href}
                        className="nav-item"
                        style={{
                            all: 'unset',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '9px',
                            padding: '7px 6px',
                            color: sector.id === active ? RED : '#000',
                            transition:
                                'color .12s, background .12s, transform .12s',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 600,
                                fontSize: '12.5px',
                                letterSpacing: '-0.01em',
                                lineHeight: 1.15,
                            }}
                        >
                            {sector.navLabel}
                        </span>
                    </Link>
                ))}
            </nav>

            {isHome && (
                <div
                    id="portal-search-aside"
                    style={{
                        marginTop: '18px',
                        paddingTop: '14px',
                        borderTop: '1px solid #000',
                    }}
                >
                    <GlobalSearch compact />
                </div>
            )}

            <div style={{ flex: 1 }} />

            <div
                id="portal-asidefoot"
                style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '9px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#999',
                    marginTop: '18px',
                }}
            >
                bue · fte · ush · sla
            </div>

            {isAuthenticated && (
                <Form {...logout.form()} style={{ marginTop: '14px' }}>
                    {({ processing }) => (
                        <button
                            type="submit"
                            disabled={processing}
                            className="logout-btn"
                            style={{
                                all: 'unset',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '9px',
                                padding: '5px 4px',
                                width: '100%',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 600,
                                fontSize: '12.5px',
                                letterSpacing: '-0.01em',
                                color: '#000',
                                transition:
                                    'color .12s, background .12s, transform .12s',
                            }}
                        >
                            Salir
                        </button>
                    )}
                </Form>
            )}
        </aside>
    );
}

type SearchResult = {
    id: string;
    label: string;
    url: string;
    groupTitle: string | null;
    sectorLabel: string | null;
    sectorHref: string | null;
};

function GlobalSearch({ compact = false }: { compact?: boolean } = {}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const requestId = useRef(0);
    const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    useEffect(() => {
        const trimmed = query.trim();
        const id = ++requestId.current;

        const timeout = setTimeout(() => {
            if (trimmed.length < 2) {
                setResults([]);
                setActiveIndex(-1);
                setLoading(false);

                return;
            }

            setLoading(true);

            fetch(search.url({ query: { q: trimmed } }), {
                headers: { Accept: 'application/json' },
            })
                .then((response) => response.json())
                .then((data: SearchResult[]) => {
                    if (id === requestId.current) {
                        setResults(data);
                        setActiveIndex(-1);
                        setLoading(false);
                    }
                })
                .catch(() => {
                    if (id === requestId.current) {
                        setLoading(false);
                    }
                });
        }, 250);

        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        if (activeIndex >= 0 && resultRefs.current[activeIndex]) {
            resultRefs.current[activeIndex]?.scrollIntoView({
                block: 'nearest',
            });
        }
    }, [activeIndex]);

    const showDropdown = open && query.trim().length >= 2;

    const iconSize = compact ? 14 : 16;
    const inputFont = compact ? '13px' : '15px';
    const gap = compact ? '8px' : '12px';

    return (
        <div
            style={{
                position: 'relative',
                width: compact ? '100%' : undefined,
            }}
            data-testid={compact ? 'search-aside' : 'search-header'}
        >
            {!compact && (
                <div
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '9px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: '#999',
                        marginBottom: '8px',
                    }}
                >
                    búsqueda global
                </div>
            )}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap,
                    borderBottom: compact
                        ? '1.5px solid #000'
                        : '2px solid #000',
                    paddingBottom: compact ? '6px' : '8px',
                }}
            >
                <svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ flex: `0 0 ${iconSize}px` }}
                >
                    <circle
                        cx="7"
                        cy="7"
                        r="5.5"
                        stroke="#000"
                        strokeWidth="1.6"
                    />
                    <line
                        x1="11.2"
                        y1="11.2"
                        x2="15"
                        y2="15"
                        stroke="#000"
                        strokeWidth="1.6"
                    />
                </svg>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                            if (!showDropdown || results.length === 0) {
                                return;
                            }

                            e.preventDefault();
                            setActiveIndex((i) =>
                                i < results.length - 1 ? i + 1 : 0,
                            );
                        } else if (e.key === 'ArrowUp') {
                            if (!showDropdown || results.length === 0) {
                                return;
                            }

                            e.preventDefault();
                            setActiveIndex((i) =>
                                i > 0 ? i - 1 : results.length - 1,
                            );
                        } else if (e.key === 'Enter') {
                            e.preventDefault();

                            if (activeIndex >= 0) {
                                window.open(results[activeIndex].url, '_blank');
                                setOpen(false);
                                setActiveIndex(-1);
                            } else {
                                const trimmed = query.trim();

                                if (trimmed.length >= 2) {
                                    router.visit(
                                        searchResults.url({
                                            query: { q: trimmed },
                                        }),
                                    );
                                }
                            }
                        } else if (e.key === 'Escape') {
                            setOpen(false);
                            setActiveIndex(-1);
                        }
                    }}
                    placeholder={
                        compact
                            ? 'Buscar…'
                            : 'Buscar documentos, formularios, sectores…'
                    }
                    style={{
                        all: 'unset',
                        flex: 1,
                        fontFamily: "'Archivo', sans-serif",
                        fontSize: inputFont,
                        fontWeight: 500,
                        color: '#000',
                    }}
                />
            </div>

            {showDropdown && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #000',
                        maxHeight: '360px',
                        overflowY: 'auto',
                        zIndex: 50,
                    }}
                >
                    {loading && (
                        <div
                            style={{
                                padding: '12px 16px',
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '11px',
                                color: '#999',
                            }}
                        >
                            buscando…
                        </div>
                    )}
                    {!loading && results.length === 0 && (
                        <div
                            style={{
                                padding: '12px 16px',
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '11px',
                                color: '#999',
                            }}
                        >
                            sin resultados.
                        </div>
                    )}
                    {!loading &&
                        results.map((result, i) => (
                            <a
                                key={result.id}
                                ref={(el) => {
                                    resultRefs.current[i] = el;
                                }}
                                href={result.url}
                                target="_blank"
                                rel="noreferrer"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setOpen(false)}
                                className={`search-result${i === activeIndex ? 'search-result-active' : ''}`}
                                style={{
                                    display: 'block',
                                    textDecoration: 'none',
                                    color: '#000',
                                    padding: '10px 16px',
                                    borderBottom: '1px dotted #ccc',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 700,
                                        fontSize: '13px',
                                    }}
                                >
                                    {result.label}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '10px',
                                        letterSpacing: '0.04em',
                                        color: '#999',
                                        marginTop: '2px',
                                    }}
                                >
                                    {[result.sectorLabel, result.groupTitle]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </div>
                            </a>
                        ))}
                </div>
            )}
        </div>
    );
}

function Header({
    dolarOficial,
    iataRate,
    isHome,
}: {
    dolarOficial: {
        venta: number;
        fecha: string | null;
    } | null;
    iataRate: { rate: number; updatedAt: string | null; stale: boolean } | null;
    isHome?: boolean;
}) {
    const iataStale =
        iataRate?.stale || isRateStale(iataRate?.updatedAt ?? null);
    const bnaStale = isRateStale(dolarOficial?.fecha ?? null);
    const bnaDate = dolarOficial?.fecha
        ? formatDay(new Date(dolarOficial.fecha))
        : formatDay(lastBusinessDay());

    const metaValStyle: React.CSSProperties = {
        fontFamily: "'Archivo', sans-serif",
        fontWeight: 900,
        fontSize: '15px',
        lineHeight: 1,
        letterSpacing: '-0.02em',
    };
    const metaLabelStyle: React.CSSProperties = {
        fontFamily: "'Space Mono', monospace",
        fontSize: '9px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#999',
    };

    // Bloques meta reutilizables (IATA / BNA / HOY) con estilo compacto 15px
    const metaBlocks = (
        <>
            <div data-testid="meta-iata">
                <div
                    style={{
                        ...metaLabelStyle,
                        color: iataStale ? RED : '#999',
                        display: 'flex',
                        gap: '6px',
                        justifyContent: 'flex-end',
                    }}
                >
                    dólar iata
                    {iataStale && (
                        <span
                            style={{
                                background: RED,
                                color: '#fff',
                                padding: '1px 5px',
                                fontSize: '8px',
                            }}
                        >
                            desact.
                        </span>
                    )}
                </div>
                <div style={metaValStyle} data-testid="meta-val">
                    {iataRate !== null ? `$${formatArs(iataRate.rate)}` : '—'}
                    <span style={{ color: RED }}>.</span>
                </div>
                <div
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '8px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#999',
                        marginTop: '3px',
                        textAlign: 'right',
                    }}
                >
                    {iataRate?.updatedAt
                        ? formatDay(new Date(iataRate.updatedAt))
                        : '—'}
                </div>
            </div>
            <div data-testid="meta-bna">
                <div
                    style={{
                        ...metaLabelStyle,
                        color: bnaStale ? RED : '#999',
                        display: 'flex',
                        gap: '6px',
                        justifyContent: 'flex-end',
                    }}
                >
                    dólar bna
                    {bnaStale && (
                        <span
                            style={{
                                background: RED,
                                color: '#fff',
                                padding: '1px 5px',
                                fontSize: '8px',
                            }}
                        >
                            desact.
                        </span>
                    )}
                </div>
                <div style={metaValStyle} data-testid="meta-val">
                    {dolarOficial !== null
                        ? `$${formatArs(dolarOficial.venta)}`
                        : '—'}
                    <span style={{ color: RED }}>.</span>
                </div>
                <div
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '8px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#999',
                        marginTop: '3px',
                        textAlign: 'right',
                    }}
                >
                    {bnaDate}
                </div>
            </div>
            <div data-testid="meta-hoy">
                <div style={metaLabelStyle}>hoy</div>
                <div style={metaValStyle} data-testid="meta-val">
                    {formatToday()}
                </div>
            </div>
        </>
    );

    if (isHome) {
        return null;
    }

    return (
        <header
            id="portal-header"
            style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '40px',
                padding: '14px 56px 12px 112px',
                borderBottom: '1px solid #000',
            }}
        >
            <div style={{ flex: 1, maxWidth: '440px' }}>
                <GlobalSearch />
            </div>
            <div style={{ display: 'flex', gap: '24px', textAlign: 'right' }}>
                {metaBlocks}
            </div>
        </header>
    );
}

const PORTAL_PHONE = 'tel:+541140000000';

const SOCIAL_LINKS: { label: string; href: string }[] = [
    { label: 'facebook', href: 'https://www.facebook.com/Eurotur.Incoming' },
    {
        label: 'instagram',
        href: 'https://www.instagram.com/eurotur.incoming/',
    },
    {
        label: 'linkedin',
        href: 'https://www.linkedin.com/company/euroturincoming',
    },
    { label: 'youtube', href: 'https://www.youtube.com/c/Euroturincoming' },
    {
        label: 'flickr',
        href: 'https://www.flickr.com/photos/182100254@N02/',
    },
];

function Footer() {
    return (
        <footer
            id="portal-footer"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '30px',
                padding: '20px 56px 22px 112px',
                borderTop: '1px solid #000',
                marginTop: 'auto',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: '40px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '0.04em',
                }}
            >
                <span>
                    <span style={{ color: '#999' }}>phone</span>
                    &nbsp;&nbsp;
                    <a
                        href={PORTAL_PHONE}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                        (011) 4000-0000
                    </a>
                </span>
                <span>
                    <span style={{ color: '#999' }}>email</span>
                    &nbsp;&nbsp;
                    <a
                        href="mailto:portal@eurotur.tur.ar"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                        portal@eurotur.tur.ar
                    </a>
                </span>
                <span style={{ color: '#999' }}>
                    Av. Montes de Oca 2238, CABA
                </span>
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#999',
                }}
            >
                <span>redes —</span>
                {SOCIAL_LINKS.map((social) => (
                    <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            color: 'inherit',
                            textDecoration: 'none',
                            borderBottom: '1px dotted #999',
                            transition: 'color .12s',
                        }}
                    >
                        {social.label}
                    </a>
                ))}
            </div>
            <img
                src="/eurotur-logo.png"
                alt="Eurotur"
                style={{ height: '38px', width: 'auto', display: 'block' }}
            />
        </footer>
    );
}
