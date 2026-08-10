import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import FrenteController from '@/actions/App/Http/Controllers/Portal/FrenteController';
import IniciativaController from '@/actions/App/Http/Controllers/Portal/IniciativaController';
import InputError from '@/components/input-error';
import type { BotMonitorProps } from '@/components/portal/bot-monitor';
import { BotMonitor } from '@/components/portal/bot-monitor';

const RED = '#E30613';

type BadgeClass = 'prod' | 'live' | 'dev' | 'test' | 'curso' | 'ana' | 'cero';

const BADGE_STYLE: Record<
    BadgeClass,
    { background: string; color: string; border: string }
> = {
    prod: { background: '#000', color: '#fff', border: '1px solid #000' },
    live: { background: RED, color: '#fff', border: `1px solid ${RED}` },
    dev: { background: '#fff', color: '#000', border: '1px solid #000' },
    test: { background: '#fff', color: RED, border: `1px solid ${RED}` },
    curso: { background: '#fff', color: '#000', border: '1px solid #000' },
    ana: { background: '#fff', color: '#8a8a8a', border: '1px solid #d9d9d9' },
    cero: {
        background: '#f6f5f2',
        color: '#8a8a8a',
        border: '1px solid #d9d9d9',
    },
};

const CLS_LABELS: Record<BadgeClass, string> = {
    prod: 'Producción',
    live: 'Funciona',
    dev: 'Desarrollo',
    test: 'En TEST',
    curso: 'En curso',
    ana: 'Análisis',
    cero: 'Sin iniciar',
};

type Initiative = {
    id: number;
    n: string;
    badge: string;
    cls: BadgeClass;
    desc: string;
    docHref?: string | null;
};
type Frente = {
    id: number;
    area: string;
    owner: string | null;
    items: Initiative[];
};

type Instructivo = {
    id: string;
    tag: string;
    title: string;
    desc: string;
    bullets: string[];
    href: string;
    ready: boolean;
};

const INSTRUCTIVOS: Instructivo[] = [
    {
        id: 'i1',
        tag: 'GUÍA',
        title: 'Cómo usar Claude',
        desc: 'Cuándo conviene usarlo, cómo escribir buenos pedidos y un menú de desafíos para practicar sobre tu propio trabajo.',
        bullets: [
            'Gemini vs. Claude: qué va a cada uno',
            'Elegir modelo y escribir buenos prompts',
            'Menú de desafíos + qué NO subir a la IA',
        ],
        href: '/instructivos/claude-eurotur.html',
        ready: true,
    },
    {
        id: 'i2',
        tag: 'GUÍA',
        title: 'Cómo usar Gemini',
        desc: 'Uso dentro de Google Workspace y automatizaciones.',
        bullets: [
            'Gemini en Gmail y Docs',
            'Extensiones y conexiones',
            'Qué datos usa y qué no',
        ],
        href: '#',
        ready: false,
    },
    {
        id: 'i3',
        tag: 'CRITERIO',
        title: 'Criterio de automatización',
        desc: 'El filtro antes de pedir un bot. Semáforo interactivo: tocá cada tarjeta y mirá si la idea VA, ESPERÁ o NO VA.',
        bullets: [
            '¿Duele de verdad? ¿Es recurrente?',
            'Bloqueantes: solape · datos · mantenimiento',
            '¿Script de clicks o IA con criterio?',
        ],
        href: '/instructivos/criterio-automatizacion.html',
        ready: true,
    },
];

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

type Props = BotMonitorProps & { frentes: Frente[] };

export default function Innovacion({ frentes, summary, stats }: Props) {
    const [layout, setLayout] = useState<'a' | 'b'>('a');
    const [editing, setEditing] = useState(false);
    const [openFrentes, setOpenFrentes] = useState<Record<string, boolean>>({});
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const [openInstr, setOpenInstr] = useState<Record<string, boolean>>({});
    const [addingFrente, setAddingFrente] = useState(false);
    const [addingItemIn, setAddingItemIn] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<number | null>(null);

    const allItems = frentes.flatMap((f) => f.items);
    const innovStats = [
        { k: String(frentes.length), l: 'frentes activos' },
        { k: String(allItems.length), l: 'iniciativas' },
        {
            k: String(allItems.filter((i) => i.badge === 'Producción').length),
            l: 'en producción',
        },
    ];

    function toggleFrente(id: number) {
        setOpenFrentes((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    function toggleItem(key: string) {
        setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    function toggleInstr(id: string) {
        setOpenInstr((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    const segBase = {
        cursor: 'pointer',
        fontFamily: "'Space Mono', monospace",
        fontSize: '11px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        padding: '7px 16px',
        border: 'none',
    };

    return (
        <>
            <Head title="Innovación" />

            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '40px',
                        marginBottom: '26px',
                    }}
                >
                    <div style={{ maxWidth: '600px' }}>
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
                            panel de innovación — ia · scripts · instructivos
                        </div>
                        <h1
                            style={{
                                fontFamily: "'Anton', sans-serif",
                                fontWeight: 400,
                                fontSize: 'clamp(64px,9vw,132px)',
                                lineHeight: 0.86,
                                margin: 0,
                                letterSpacing: '-0.005em',
                            }}
                        >
                            Innovación
                            <span style={{ color: RED }}>.</span>
                        </h1>
                        <p
                            style={{
                                maxWidth: '490px',
                                margin: '18px 0 0',
                                fontSize: '15px',
                                lineHeight: 1.5,
                                fontWeight: 500,
                                color: '#111',
                            }}
                        >
                            Todo lo que estamos haciendo con IA en Eurotur, en
                            un solo lugar: automatizaciones en marcha e
                            instructivos para usarlas. Tocá cada bloque para ver
                            el detalle.
                        </p>
                    </div>
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: 'clamp(80px,10vw,140px)',
                            lineHeight: 0.72,
                        }}
                    >
                        14
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4,1fr)',
                        borderTop: '3px solid #000',
                        borderBottom: '1px solid #000',
                        borderLeft: '1px solid #000',
                    }}
                >
                    {innovStats.map((s) => (
                        <div
                            key={s.l}
                            style={{
                                padding: '14px 18px 16px 18px',
                                borderRight: '1px dotted #000',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: '40px',
                                    lineHeight: 0.8,
                                }}
                            >
                                {s.k}
                            </div>
                            <div
                                style={{
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: '10px',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#666',
                                    marginTop: '8px',
                                }}
                            >
                                {s.l}
                            </div>
                        </div>
                    ))}
                    <div style={{ padding: '14px 18px 16px 18px' }}>
                        <div
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 900,
                                fontSize: '40px',
                                lineHeight: 0.8,
                            }}
                        >
                            {INSTRUCTIVOS.length}
                        </div>
                        <div
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '10px',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#666',
                                marginTop: '8px',
                            }}
                        >
                            instructivos ia
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
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
                        automatizaciones
                        <span style={{ color: RED }}>—</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <div
                            style={{
                                display: 'inline-flex',
                                border: '1px solid #000',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setLayout('a')}
                                style={{
                                    ...segBase,
                                    background:
                                        layout === 'a' ? '#000' : '#fff',
                                    color: layout === 'a' ? '#fff' : '#000',
                                }}
                            >
                                índice
                            </button>
                            <button
                                type="button"
                                onClick={() => setLayout('b')}
                                style={{
                                    ...segBase,
                                    background:
                                        layout === 'b' ? '#000' : '#fff',
                                    color: layout === 'b' ? '#fff' : '#000',
                                }}
                            >
                                mosaico
                            </button>
                        </div>
                        {layout === 'a' && (
                            <button
                                type="button"
                                onClick={() => setEditing((v) => !v)}
                                style={{
                                    ...smallButtonStyle,
                                    background: editing ? RED : 'transparent',
                                    color: editing ? '#fff' : '#000',
                                    borderColor: editing ? RED : '#000',
                                }}
                            >
                                {editing ? 'Listo ✕' : 'Editar ✎'}
                            </button>
                        )}
                    </div>
                </div>

                {layout === 'a' ? (
                    <div>
                        {frentes.map((f, frenteIndex) => {
                            const open = !!openFrentes[f.id];

                            return (
                                <div
                                    key={f.id}
                                    style={{ borderBottom: '1px solid #000' }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleFrente(f.id)}
                                            className="innov-frente-header"
                                            style={{
                                                cursor: 'pointer',
                                                boxSizing: 'border-box',
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '18px',
                                                padding: '18px 4px',
                                                background: 'transparent',
                                                border: 'none',
                                                transition:
                                                    'background .12s,transform .12s',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontFamily:
                                                        "'Anton', sans-serif",
                                                    fontSize: '30px',
                                                    color: RED,
                                                    lineHeight: 1,
                                                    flex: '0 0 auto',
                                                }}
                                            >
                                                {String(
                                                    frenteIndex + 1,
                                                ).padStart(2, '0')}
                                            </span>
                                            <span
                                                style={{
                                                    fontFamily:
                                                        "'Archivo', sans-serif",
                                                    fontWeight: 800,
                                                    fontSize: '18px',
                                                    letterSpacing: '-0.01em',
                                                }}
                                            >
                                                {f.area}
                                            </span>
                                            <span
                                                style={{
                                                    marginLeft: 'auto',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '16px',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "'Space Mono', monospace",
                                                        fontSize: '10px',
                                                        letterSpacing: '0.06em',
                                                        textTransform:
                                                            'uppercase',
                                                        color: '#666',
                                                    }}
                                                >
                                                    {f.items.length} iniciativas
                                                </span>
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "'Archivo', sans-serif",
                                                        fontWeight: 900,
                                                        fontSize: '26px',
                                                        color: RED,
                                                        lineHeight: 1,
                                                        width: '18px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {open ? '–' : '+'}
                                                </span>
                                            </span>
                                        </button>
                                        {editing && (
                                            <Form
                                                {...FrenteController.destroy.form(
                                                    { frente: f.id },
                                                )}
                                            >
                                                {({ processing }) => (
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        title="Eliminar frente"
                                                        style={{
                                                            all: 'unset',
                                                            cursor: 'pointer',
                                                            color: RED,
                                                            fontFamily:
                                                                "'Space Mono', monospace",
                                                            fontSize: '13px',
                                                            flex: '0 0 auto',
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </Form>
                                        )}
                                    </div>
                                    {open && (
                                        <div
                                            style={{
                                                padding: '0 4px 22px 62px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            {f.items.map((it, idx) => (
                                                <div
                                                    key={it.id}
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns:
                                                            '1fr auto',
                                                        gap: '20px',
                                                        alignItems: 'start',
                                                        padding: '14px 0',
                                                        borderTop:
                                                            '1px dotted #cfcfcf',
                                                    }}
                                                >
                                                    {editingItem === it.id ? (
                                                        <div
                                                            style={{
                                                                gridColumn:
                                                                    '1 / -1',
                                                            }}
                                                        >
                                                            <IniciativaForm
                                                                frenteId={f.id}
                                                                item={it}
                                                                onDone={() =>
                                                                    setEditingItem(
                                                                        null,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Archivo', sans-serif",
                                                                        fontWeight: 700,
                                                                        fontSize:
                                                                            '15px',
                                                                    }}
                                                                >
                                                                    {it.n}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            '12.5px',
                                                                        color: '#777',
                                                                        lineHeight: 1.45,
                                                                        marginTop:
                                                                            '4px',
                                                                        maxWidth:
                                                                            '560px',
                                                                    }}
                                                                >
                                                                    {it.desc}
                                                                </div>
                                                            </div>
                                                            <div
                                                                style={{
                                                                    display:
                                                                        'flex',
                                                                    flexDirection:
                                                                        'column',
                                                                    alignItems:
                                                                        'flex-end',
                                                                    gap: '6px',
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                        gap: '8px',
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{
                                                                            fontFamily:
                                                                                "'Space Mono', monospace",
                                                                            fontSize:
                                                                                '9.5px',
                                                                            letterSpacing:
                                                                                '0.08em',
                                                                            textTransform:
                                                                                'uppercase',
                                                                            padding:
                                                                                '4px 8px',
                                                                            whiteSpace:
                                                                                'nowrap',
                                                                            ...BADGE_STYLE[
                                                                                it
                                                                                    .cls
                                                                            ],
                                                                        }}
                                                                    >
                                                                        {
                                                                            it.badge
                                                                        }
                                                                    </span>
                                                                    {editing && (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setEditingItem(
                                                                                        it.id,
                                                                                    )
                                                                                }
                                                                                title="Editar"
                                                                                style={{
                                                                                    all: 'unset',
                                                                                    cursor: 'pointer',
                                                                                    fontFamily:
                                                                                        "'Space Mono', monospace",
                                                                                    fontSize:
                                                                                        '10px',
                                                                                    color: '#666',
                                                                                }}
                                                                            >
                                                                                ✎
                                                                            </button>
                                                                            <Form
                                                                                {...IniciativaController.destroy.form(
                                                                                    {
                                                                                        iniciativa:
                                                                                            it.id,
                                                                                    },
                                                                                )}
                                                                            >
                                                                                {({
                                                                                    processing,
                                                                                }) => (
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
                                                                                                '10px',
                                                                                            color: RED,
                                                                                        }}
                                                                                    >
                                                                                        ✕
                                                                                    </button>
                                                                                )}
                                                                            </Form>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                {it.docHref && (
                                                                    <a
                                                                        href={
                                                                            it.docHref
                                                                        }
                                                                        download
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        style={{
                                                                            textDecoration:
                                                                                'none',
                                                                            fontFamily:
                                                                                "'Space Mono', monospace",
                                                                            fontSize:
                                                                                '9.5px',
                                                                            letterSpacing:
                                                                                '0.08em',
                                                                            textTransform:
                                                                                'uppercase',
                                                                            padding:
                                                                                '4px 8px',
                                                                            whiteSpace:
                                                                                'nowrap',
                                                                            border: '1px solid #000',
                                                                            color: '#000',
                                                                            background:
                                                                                '#fff',
                                                                            cursor: 'pointer',
                                                                        }}
                                                                    >
                                                                        Documentación
                                                                        ⭳
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                    {frenteIndex === 0 &&
                                                        idx === 0 &&
                                                        editingItem !==
                                                            it.id && (
                                                            <div
                                                                style={{
                                                                    gridColumn:
                                                                        '1 / -1',
                                                                }}
                                                            >
                                                                <BotMonitor
                                                                    summary={
                                                                        summary
                                                                    }
                                                                    stats={
                                                                        stats
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                </div>
                                            ))}
                                            {editing && (
                                                <div
                                                    style={{
                                                        paddingTop: '14px',
                                                    }}
                                                >
                                                    {addingItemIn === f.id ? (
                                                        <IniciativaForm
                                                            frenteId={f.id}
                                                            onDone={() =>
                                                                setAddingItemIn(
                                                                    null,
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setAddingItemIn(
                                                                    f.id,
                                                                )
                                                            }
                                                            style={
                                                                smallButtonStyle
                                                            }
                                                        >
                                                            + agregar iniciativa
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {editing && (
                            <div style={{ padding: '18px 4px' }}>
                                {addingFrente ? (
                                    <AddFrenteForm
                                        onDone={() => setAddingFrente(false)}
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setAddingFrente(true)}
                                        style={smallButtonStyle}
                                    >
                                        + agregar frente
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4,1fr)',
                            gap: 0,
                            borderLeft: '1px solid #000',
                        }}
                    >
                        {frentes.map((f, frenteIndex) => (
                            <div
                                key={f.id}
                                style={{
                                    borderRight: '1px solid #000',
                                    borderBottom: '1px solid #000',
                                    padding: '16px 14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontFamily: "'Anton', sans-serif",
                                            fontSize: '34px',
                                            color: RED,
                                            lineHeight: 0.9,
                                        }}
                                    >
                                        {String(frenteIndex + 1).padStart(
                                            2,
                                            '0',
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 800,
                                            fontSize: '14px',
                                            letterSpacing: '-0.01em',
                                            marginTop: '6px',
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {f.area}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                    }}
                                >
                                    {f.items.map((it) => {
                                        const key = 'i-' + it.id;
                                        const open = !!openItems[key];

                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => toggleItem(key)}
                                                className="innov-mosaic-item"
                                                style={{
                                                    cursor: 'pointer',
                                                    boxSizing: 'border-box',
                                                    border: '1px solid #dcdcdc',
                                                    padding: '10px 11px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    background: 'transparent',
                                                    transition:
                                                        'border-color .12s,transform .12s',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        alignSelf: 'flex-start',
                                                        fontFamily:
                                                            "'Space Mono', monospace",
                                                        fontSize: '9.5px',
                                                        letterSpacing: '0.08em',
                                                        textTransform:
                                                            'uppercase',
                                                        padding: '4px 8px',
                                                        ...BADGE_STYLE[it.cls],
                                                    }}
                                                >
                                                    {it.badge}
                                                </span>
                                                <span
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'baseline',
                                                        justifyContent:
                                                            'space-between',
                                                        gap: '8px',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontFamily:
                                                                "'Archivo', sans-serif",
                                                            fontWeight: 700,
                                                            fontSize: '13px',
                                                            lineHeight: 1.2,
                                                        }}
                                                    >
                                                        {it.n}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontFamily:
                                                                "'Archivo', sans-serif",
                                                            fontWeight: 900,
                                                            fontSize: '16px',
                                                            color: RED,
                                                            lineHeight: 1,
                                                            flex: '0 0 auto',
                                                        }}
                                                    >
                                                        {open ? '–' : '+'}
                                                    </span>
                                                </span>
                                                {open && (
                                                    <span
                                                        style={{
                                                            fontSize: '11.5px',
                                                            color: '#777',
                                                            lineHeight: 1.45,
                                                        }}
                                                    >
                                                        {it.desc}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginTop: '26px',
                        borderLeft: `3px solid ${RED}`,
                        background: '#faf7f7',
                        padding: '14px 18px',
                    }}
                >
                    <span
                        style={{
                            fontFamily: "'Anton', sans-serif",
                            fontSize: '30px',
                            color: RED,
                            lineHeight: 1,
                            flex: '0 0 auto',
                        }}
                    >
                        !
                    </span>
                    <span
                        style={{
                            fontSize: '13.5px',
                            color: '#222',
                            lineHeight: 1.5,
                            maxWidth: '780px',
                        }}
                    >
                        Cinco frentes avanzando en paralelo, todavía sin
                        criterio ni documentación común. Este panel existe para
                        verlos juntos y no duplicar esfuerzo.
                    </span>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        borderBottom: '3px solid #000',
                        paddingBottom: '10px',
                        margin: '40px 0 0',
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
                        instructivos ia
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
                        ↗ abrí el documento · + detalle
                    </div>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3,1fr)',
                        gap: 0,
                        borderLeft: '1px solid #000',
                    }}
                >
                    {INSTRUCTIVOS.map((i) => {
                        const open = !!openInstr[i.id];

                        return (
                            <div
                                key={i.id}
                                className="innov-instr-card"
                                style={{
                                    borderRight: '1px solid #000',
                                    borderBottom: '1px solid #000',
                                    padding: '18px 18px 16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: '158px',
                                    transition: 'background .12s',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleInstr(i.id)}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        textAlign: 'left',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '9px',
                                            letterSpacing: '0.14em',
                                            color: RED,
                                        }}
                                    >
                                        {i.tag}
                                    </span>
                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            justifyContent: 'space-between',
                                            gap: '10px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily:
                                                    "'Archivo', sans-serif",
                                                fontWeight: 800,
                                                fontSize: '17px',
                                                letterSpacing: '-0.01em',
                                                lineHeight: 1.05,
                                            }}
                                        >
                                            {i.title}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily:
                                                    "'Archivo', sans-serif",
                                                fontWeight: 900,
                                                fontSize: '22px',
                                                color: RED,
                                                lineHeight: 1,
                                                flex: '0 0 auto',
                                            }}
                                        >
                                            {open ? '–' : '+'}
                                        </span>
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '12.5px',
                                            color: '#777',
                                            lineHeight: 1.45,
                                        }}
                                    >
                                        {i.desc}
                                    </span>
                                </button>
                                {open && (
                                    <div
                                        style={{
                                            marginTop: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px',
                                        }}
                                    >
                                        {i.bullets.map((b) => (
                                            <div
                                                key={b}
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    fontSize: '12.5px',
                                                    color: '#333',
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: RED,
                                                        fontFamily:
                                                            "'Space Mono', monospace",
                                                    }}
                                                >
                                                    ·
                                                </span>
                                                <span>{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {i.ready ? (
                                    <a
                                        href={i.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="innov-instr-link"
                                        style={{
                                            marginTop: 'auto',
                                            alignSelf: 'flex-start',
                                            textDecoration: 'none',
                                            color: '#fff',
                                            background: RED,
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 800,
                                            fontSize: '13px',
                                            padding: '9px 13px',
                                            display: 'inline-flex',
                                            gap: '8px',
                                            alignItems: 'center',
                                            transition:
                                                'background .12s,transform .12s',
                                        }}
                                    >
                                        Abrir instructivo
                                        <span
                                            style={{
                                                fontFamily:
                                                    "'Space Mono', monospace",
                                                fontSize: '12px',
                                            }}
                                        >
                                            ↗
                                        </span>
                                    </a>
                                ) : (
                                    <div
                                        style={{
                                            marginTop: 'auto',
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '10px',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            color: '#c4c4c4',
                                            paddingTop: '10px',
                                        }}
                                    >
                                        en preparación
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div
                    style={{
                        marginTop: '34px',
                        borderTop: '1px solid #000',
                        paddingTop: '14px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#666',
                    }}
                >
                    mantiene— Homez, Valentina · actualizado 07·2026
                </div>
            </section>
        </>
    );
}

function AddFrenteForm({ onDone }: { onDone: () => void }) {
    return (
        <Form
            {...FrenteController.store.form()}
            resetOnSuccess
            onSuccess={onDone}
            className="flex items-end gap-3"
        >
            {({ processing, errors }) => (
                <>
                    <div style={{ flex: 1, maxWidth: '320px' }}>
                        <input
                            name="area"
                            placeholder="Área del frente…"
                            required
                            style={labelFieldStyle}
                        />
                        <InputError message={errors.area} />
                    </div>
                    <div style={{ flex: 1, maxWidth: '260px' }}>
                        <input
                            name="owner"
                            placeholder="Responsable (opcional)"
                            style={labelFieldStyle}
                        />
                        <InputError message={errors.owner} />
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

function IniciativaForm({
    frenteId,
    item,
    onDone,
}: {
    frenteId: number;
    item?: Initiative;
    onDone: () => void;
}) {
    const [mode, setMode] = useState<'url' | 'file'>('url');
    const action = item
        ? IniciativaController.update.form({ iniciativa: item.id })
        : IniciativaController.store.form({ frente: frenteId });

    return (
        <Form {...action} onSuccess={onDone} className="flex flex-col gap-2">
            {({ processing, errors }) => (
                <>
                    <input
                        name="n"
                        placeholder="Título de la iniciativa"
                        defaultValue={item?.n}
                        required
                        style={labelFieldStyle}
                    />
                    <InputError message={errors.n} />

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                name="badge"
                                placeholder="Texto del badge (ej. Producción)"
                                defaultValue={item?.badge}
                                required
                                style={labelFieldStyle}
                            />
                            <InputError message={errors.badge} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <select
                                name="cls"
                                defaultValue={item?.cls ?? 'cero'}
                                required
                                style={labelFieldStyle}
                            >
                                {Object.entries(CLS_LABELS).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                            <InputError message={errors.cls} />
                        </div>
                    </div>

                    <textarea
                        name="desc"
                        placeholder="Descripción"
                        defaultValue={item?.desc}
                        required
                        rows={2}
                        style={{ ...labelFieldStyle, resize: 'vertical' }}
                    />
                    <InputError message={errors.desc} />

                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            fontSize: '10px',
                        }}
                    >
                        <label
                            style={{
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="radio"
                                checked={mode === 'url'}
                                onChange={() => setMode('url')}
                            />
                            URL de documentación
                        </label>
                        <label
                            style={{
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="radio"
                                checked={mode === 'file'}
                                onChange={() => setMode('file')}
                            />
                            Archivo
                        </label>
                    </div>

                    {mode === 'url' ? (
                        <input
                            name="url"
                            type="url"
                            defaultValue={item?.docHref ?? ''}
                            placeholder="https://… (opcional)"
                            style={labelFieldStyle}
                        />
                    ) : (
                        <input
                            name="file"
                            type="file"
                            style={{ fontSize: '11px' }}
                        />
                    )}
                    <InputError message={errors.url} />
                    <InputError message={errors.file} />

                    <div style={{ display: 'flex', gap: '8px' }}>
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
                    </div>
                </>
            )}
        </Form>
    );
}

Innovacion.layout = { active: 'innovacion', label: 'Innovación—' };
