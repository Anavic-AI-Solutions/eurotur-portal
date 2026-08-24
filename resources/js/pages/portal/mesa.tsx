import { Head } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ImageSlot } from '@/components/portal/image-slot';

const RED = '#E30613';

type Credential = { id: string; label: string; sub: string; pass: string };

const CREDENTIALS: Credential[] = [
    {
        id: 'euro',
        label: 'Wi-Fi · EuroTucuman',
        sub: 'Red: EuroTucuman · EuroTucuman 5Ghz',
        pass: '825.Tucum@n',
    },
    {
        id: 'meet',
        label: 'Sala de Reuniones · Meet Tucuman',
        sub: 'Acceso de red',
        pass: 'Eurt825*',
    },
];

function StepRow({ n, children }: { n: string; children: ReactNode }) {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '18px',
                padding: '15px 0',
                borderBottom: '1px solid #ececec',
                fontSize: '14px',
                lineHeight: 1.5,
            }}
        >
            <span
                style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontWeight: 900,
                    fontSize: '17px',
                    color: RED,
                }}
            >
                {n}
            </span>
            <span>{children}</span>
        </div>
    );
}

export default function Mesa() {
    const [revealed, setRevealed] = useState<Record<string, boolean>>({});
    const [copied, setCopied] = useState<string | null>(null);
    const copyTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    function toggleReveal(id: string) {
        setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    function copyValue(id: string, value: string) {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(value).catch(() => {});
        }

        setCopied(id);
        clearTimeout(copyTimeout.current);
        copyTimeout.current = setTimeout(() => setCopied(null), 1500);
    }

    return (
        <>
            <Head title="Mesa de Información" />

            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '40px',
                        marginBottom: '24px',
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
                            ayuda rápida · faq técnico
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
                            Mesa de
                            <br />
                            información
                            <span style={{ color: RED }}>.</span>
                        </h1>
                        <p
                            style={{
                                maxWidth: '480px',
                                margin: '16px 0 0',
                                fontSize: '14px',
                                lineHeight: 1.5,
                                fontWeight: 500,
                                color: '#111',
                            }}
                        >
                            Todo lo que podés resolver solo: telefonía, VPN,
                            contraseñas, pantallas y sonido. Guías paso a paso.
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
                        12
                    </div>
                </div>

                <div style={{ border: '1px solid #000', marginBottom: '34px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#000',
                            color: '#fff',
                            padding: '12px 18px',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 800,
                                fontSize: '16px',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Accesos de red · Tucumán
                        </span>
                        <span
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '9px',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: '#ff6a72',
                            }}
                        >
                            ● acceso interno
                        </span>
                    </div>
                    {CREDENTIALS.map((c) => {
                        const shown = !!revealed[c.id];

                        return (
                            <div
                                key={c.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '20px',
                                    padding: '14px 18px',
                                    borderTop: '1px solid #ececec',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 700,
                                            fontSize: '14px',
                                        }}
                                    >
                                        {c.label}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '10.5px',
                                            color: '#888',
                                            marginTop: '3px',
                                        }}
                                    >
                                        {c.sub}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        flex: '0 0 auto',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '15px',
                                            fontWeight: 700,
                                            letterSpacing: '0.08em',
                                            minWidth: '120px',
                                            textAlign: 'right',
                                            color: '#111',
                                        }}
                                    >
                                        {shown ? c.pass : '••••••••'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => toggleReveal(c.id)}
                                        className="mesa-cred-btn"
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '10px',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            border: '1px solid #000',
                                            background: 'transparent',
                                            padding: '7px 11px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {shown ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => copyValue(c.id, c.pass)}
                                        className="mesa-copy-btn"
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '10px',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            border: '1px solid #000',
                                            background: 'transparent',
                                            padding: '7px 11px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {copied === c.id
                                            ? '¡Copiado!'
                                            : 'Copiar'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '9.5px',
                            letterSpacing: '0.05em',
                            color: '#999',
                            padding: '11px 18px',
                            borderTop: '1px solid #ececec',
                            background: '#faf7f7',
                            lineHeight: 1.5,
                        }}
                    >
                        Las claves quedan ocultas por defecto. Tocá «Mostrar»
                        solo cuando las necesites y evitá compartir capturas con
                        la clave a la vista.
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        borderBottom: '3px solid #000',
                        paddingBottom: '10px',
                        margin: '8px 0 0',
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
                        Guías paso a paso
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
                        telefonía · vpn · pantallas · sonido
                    </div>
                </div>

                {/* 02 · Salidas de llamadas */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '0.82fr 1.18fr',
                        gap: 'clamp(24px,4vw,56px)',
                        padding: '34px 0 44px',
                        borderBottom: '1px solid #d8d8d8',
                        alignItems: 'start',
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
                            }}
                        >
                            telefonía
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                                marginTop: '12px',
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(40px,5vw,66px)',
                                    lineHeight: 0.78,
                                    letterSpacing: '-0.03em',
                                    color: RED,
                                }}
                            >
                                02
                            </span>
                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(26px,3.3vw,40px)',
                                    lineHeight: 0.92,
                                    letterSpacing: '-0.02em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Salidas de
                                <br />
                                llamadas
                            </h2>
                        </div>
                        <p
                            style={{
                                margin: '18px 0 0',
                                fontSize: '13.5px',
                                lineHeight: 1.55,
                                color: '#333',
                                maxWidth: '320px',
                            }}
                        >
                            Tabla de discado interno. Antepené el prefijo según
                            el tipo de llamada que necesites hacer.
                        </p>
                    </div>
                    <div style={{ paddingTop: '4px' }}>
                        <div style={{ borderTop: '2px solid #000' }}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'auto 1fr',
                                    alignItems: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 900,
                                        fontSize: '38px',
                                        letterSpacing: '-0.03em',
                                        color: RED,
                                        padding: '15px 24px 15px 0',
                                        borderBottom: '1px solid #ececec',
                                    }}
                                >
                                    9
                                </div>
                                <div
                                    style={{
                                        padding: '15px 0',
                                        borderBottom: '1px solid #ececec',
                                        fontSize: '14px',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    <b>Nacionales y móvil</b> — con 15.
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 900,
                                        fontSize: '38px',
                                        letterSpacing: '-0.03em',
                                        padding: '15px 24px 15px 0',
                                        borderBottom: '1px solid #ececec',
                                    }}
                                >
                                    803
                                </div>
                                <div
                                    style={{
                                        padding: '15px 0',
                                        borderBottom: '1px solid #ececec',
                                        fontSize: '14px',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    <b>Internacionales</b>
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 900,
                                        fontSize: '38px',
                                        letterSpacing: '-0.03em',
                                        padding: '15px 24px 15px 0',
                                        borderBottom: '1px solid #ececec',
                                    }}
                                >
                                    804
                                </div>
                                <div
                                    style={{
                                        padding: '15px 0',
                                        borderBottom: '1px solid #ececec',
                                        fontSize: '14px',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    <b>Internacionales</b>
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 800,
                                        fontSize: '16px',
                                        textTransform: 'uppercase',
                                        padding: '15px 24px 15px 0',
                                    }}
                                >
                                    Transferir
                                </div>
                                <div style={{ padding: '15px 0' }}>
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontWeight: 700,
                                            fontSize: '18px',
                                            color: RED,
                                        }}
                                    >
                                        **(interno)#
                                    </span>
                                </div>
                            </div>
                        </div>
                        <a
                            href="https://docs.google.com/spreadsheets/d/1h7AeaE-jK7ddSE0KTYSyYm6RC2IErJLl4OQ-2DeygcM/edit"
                            target="_blank"
                            rel="noreferrer"
                            className="doc-link"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'baseline',
                                gap: '6px',
                                marginTop: '22px',
                                textDecoration: 'none',
                                color: '#000',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 700,
                                fontSize: '13px',
                                borderBottom: '1px solid #c4c4c4',
                                paddingBottom: '3px',
                                transition:
                                    'color .1s,border-color .1s,transform .1s',
                            }}
                        >
                            Tabla de discar
                            <span
                                style={{
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: '10px',
                                    color: RED,
                                }}
                            >
                                ↗
                            </span>
                        </a>
                    </div>
                </div>

                {/* 03 · Bloqueo de VPN */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1.08fr 0.92fr',
                        background: '#000',
                        color: '#fff',
                        margin: '44px 0',
                        alignItems: 'stretch',
                    }}
                >
                    <div style={{ padding: 'clamp(28px,4vw,52px)' }}>
                        <div
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '10px',
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: '#ff6a72',
                            }}
                        >
                            03 · red · vpn
                        </div>
                        <h2
                            style={{
                                margin: '10px 0 0',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 900,
                                fontSize: 'clamp(30px,4.4vw,58px)',
                                lineHeight: 0.9,
                                letterSpacing: '-0.02em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Bloqueo
                            <br />
                            de VPN
                        </h2>
                        <div
                            style={{
                                width: '56px',
                                height: '7px',
                                background: RED,
                                margin: '20px 0 26px',
                            }}
                        />
                        <p
                            style={{
                                margin: 0,
                                fontSize: '14.5px',
                                lineHeight: 1.6,
                                color: '#cfcfcf',
                            }}
                        >
                            Si el proceso de conexión{' '}
                            <b style={{ color: '#fff' }}>no avanza</b> (queda
                            estancado) o{' '}
                            <b style={{ color: '#fff' }}>
                                llega al 45% y no progresa
                            </b>
                            , la VPN está bloqueada.
                        </p>
                        <div
                            style={{
                                borderLeft: `3px solid ${RED}`,
                                padding: '2px 0 2px 16px',
                                margin: '24px 0',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: '10px',
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase',
                                    color: '#ff6a72',
                                }}
                            >
                                importante
                            </div>
                            <p
                                style={{
                                    margin: '8px 0 0',
                                    fontSize: '13.5px',
                                    lineHeight: 1.55,
                                    color: '#cfcfcf',
                                }}
                            >
                                La VPN es muy sensible. Tras{' '}
                                <b style={{ color: '#fff' }}>
                                    3 intentos fallidos
                                </b>{' '}
                                consecutivos se bloquea automáticamente.
                            </p>
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '13.5px',
                                lineHeight: 1.55,
                                color: '#cfcfcf',
                            }}
                        >
                            Contactá de inmediato al equipo de{' '}
                            <b style={{ color: '#fff' }}>Sistemas</b> para
                            solicitar el desbloqueo.
                        </p>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#111',
                            borderLeft: '1px solid #333',
                            padding: '18px',
                        }}
                    >
                        <ImageSlot
                            src="/img/mesa-vpn.webp"
                            placeholder="Captura: VPN estancada al 45%"
                            contain
                        />
                    </div>
                </div>

                {/* 04 · Apagado de pantalla */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '0.82fr 1.18fr',
                        gap: 'clamp(24px,4vw,56px)',
                        padding: '34px 0 44px',
                        borderBottom: '1px solid #d8d8d8',
                        alignItems: 'start',
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
                            }}
                        >
                            windows
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                                marginTop: '12px',
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(40px,5vw,66px)',
                                    lineHeight: 0.78,
                                    letterSpacing: '-0.03em',
                                    color: RED,
                                }}
                            >
                                04
                            </span>
                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(24px,3vw,36px)',
                                    lineHeight: 0.92,
                                    letterSpacing: '-0.02em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Apagado de
                                <br />
                                pantalla
                            </h2>
                        </div>
                        <p
                            style={{
                                margin: '18px 0 0',
                                fontSize: '13.5px',
                                lineHeight: 1.55,
                                color: '#333',
                                maxWidth: '320px',
                            }}
                        >
                            Ajustá en cuánto tiempo se apaga la pantalla o entra
                            en suspensión la notebook.
                        </p>
                    </div>
                    <div style={{ borderTop: '2px solid #000' }}>
                        <StepRow n="01">
                            Clic en <b>Inicio</b> → escribí <b>Configuración</b>{' '}
                            y abrí la app.
                        </StepRow>
                        <StepRow n="02">
                            Andá a <b>Sistema</b> → <b>Pantalla</b>.
                        </StepRow>
                        <StepRow n="03">
                            En el menú lateral: <b>Energía y batería</b> →{' '}
                            <b>
                                Tiempo de espera de hibernación, suspensión y
                                pantalla
                            </b>
                            .
                        </StepRow>
                        <StepRow n="04">
                            Vas a ver: <b>Desactivar pantalla después de</b> y{' '}
                            <b>Suspensión después de</b>.
                        </StepRow>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr',
                                gap: '18px',
                                padding: '15px 0',
                                fontSize: '14px',
                                lineHeight: 1.5,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: '17px',
                                    color: RED,
                                }}
                            >
                                05
                            </span>
                            <span>
                                Elegí el tiempo que prefieras:{' '}
                                <b>5, 10, 45 minutos</b> o <b>«Nunca»</b>.
                            </span>
                        </div>
                    </div>
                </div>

                {/* 05 · Cambio de contraseña */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '0.82fr 1.18fr',
                        gap: 'clamp(24px,4vw,56px)',
                        padding: '34px 0 44px',
                        borderBottom: '1px solid #d8d8d8',
                        alignItems: 'start',
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
                            }}
                        >
                            seguridad
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                                marginTop: '12px',
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(40px,5vw,66px)',
                                    lineHeight: 0.78,
                                    letterSpacing: '-0.03em',
                                    color: RED,
                                }}
                            >
                                05
                            </span>
                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(24px,3vw,36px)',
                                    lineHeight: 0.92,
                                    letterSpacing: '-0.02em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Cambio de
                                <br />
                                contraseña
                            </h2>
                        </div>
                        <p
                            style={{
                                margin: '18px 0 0',
                                fontSize: '13.5px',
                                lineHeight: 1.55,
                                color: '#333',
                                maxWidth: '320px',
                            }}
                        >
                            Desde la notebook. El cambio se propaga a todos los
                            accesos.
                        </p>
                        <div
                            style={{
                                border: '1px solid #000',
                                padding: '15px 18px',
                                marginTop: '22px',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: '10px',
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase',
                                    color: RED,
                                }}
                            >
                                importante
                            </div>
                            <p
                                style={{
                                    margin: '8px 0 0',
                                    fontSize: '13px',
                                    lineHeight: 1.5,
                                    color: '#333',
                                }}
                            >
                                Debe ser segura: letras, números y símbolos. Una
                                vez actualizada, aplica en <b>TS, VPN, Spark</b>
                                , etc.
                            </p>
                        </div>
                    </div>
                    <div style={{ borderTop: '2px solid #000' }}>
                        <StepRow n="01">
                            Presioná <b>Ctrl + Alt + Supr</b> → aparece el menú
                            de opciones.
                        </StepRow>
                        <StepRow n="02">
                            Seleccioná <b>«Cambiar contraseña»</b>.
                        </StepRow>
                        <StepRow n="03">
                            Ingresá tu <b>contraseña actual</b>.
                        </StepRow>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr',
                                gap: '18px',
                                padding: '15px 0',
                                fontSize: '14px',
                                lineHeight: 1.5,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: '17px',
                                    color: RED,
                                }}
                            >
                                04
                            </span>
                            <span>
                                Escribí la <b>nueva contraseña</b> y confirmala.
                            </span>
                        </div>
                    </div>
                </div>

                {/* 06 · Configuración de pantallas */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '0.82fr 1.18fr',
                        gap: 'clamp(24px,4vw,56px)',
                        padding: '34px 0 44px',
                        borderBottom: '1px solid #d8d8d8',
                        alignItems: 'start',
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
                            }}
                        >
                            hardware
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                                marginTop: '12px',
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(40px,5vw,66px)',
                                    lineHeight: 0.78,
                                    letterSpacing: '-0.03em',
                                    color: RED,
                                }}
                            >
                                06
                            </span>
                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(23px,2.9vw,34px)',
                                    lineHeight: 0.92,
                                    letterSpacing: '-0.02em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Config. de
                                <br />
                                pantallas
                            </h2>
                        </div>
                        <p
                            style={{
                                margin: '18px 0 0',
                                fontSize: '13.5px',
                                lineHeight: 1.55,
                                color: '#333',
                                maxWidth: '320px',
                            }}
                        >
                            Notebook + monitor externo. Clic derecho en el
                            escritorio → <b>Configuración de pantalla</b>.
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#111',
                                padding: '16px',
                                marginTop: '22px',
                            }}
                        >
                            <ImageSlot
                                src="/img/mesa-pantallas.webp"
                                placeholder="Captura: configuración de pantallas"
                                contain
                            />
                        </div>
                    </div>
                    <div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 0,
                                borderTop: '2px solid #000',
                                borderLeft: '1px solid #000',
                            }}
                        >
                            <div
                                style={{
                                    borderRight: '1px solid #000',
                                    borderBottom: '1px solid #000',
                                    padding: '16px',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 800,
                                        fontSize: '15px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Duplicar
                                </div>
                                <p
                                    style={{
                                        margin: '8px 0 0',
                                        fontSize: '12.5px',
                                        lineHeight: 1.5,
                                        color: '#333',
                                    }}
                                >
                                    Muestra lo mismo en la notebook y el
                                    monitor.
                                </p>
                            </div>
                            <div
                                style={{
                                    position: 'relative',
                                    borderRight: '1px solid #000',
                                    borderBottom: '1px solid #000',
                                    padding: '16px',
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '9px',
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        color: RED,
                                    }}
                                >
                                    recomendado
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 800,
                                        fontSize: '15px',
                                        textTransform: 'uppercase',
                                        color: RED,
                                    }}
                                >
                                    Extender
                                </div>
                                <p
                                    style={{
                                        margin: '8px 0 0',
                                        fontSize: '12.5px',
                                        lineHeight: 1.5,
                                        color: '#333',
                                    }}
                                >
                                    Trabajás con ambas pantallas.
                                </p>
                            </div>
                            <div
                                style={{
                                    borderRight: '1px solid #000',
                                    borderBottom: '1px solid #000',
                                    padding: '16px',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 800,
                                        fontSize: '15px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Sólo en 1
                                </div>
                                <p
                                    style={{
                                        margin: '8px 0 0',
                                        fontSize: '12.5px',
                                        lineHeight: 1.5,
                                        color: '#333',
                                    }}
                                >
                                    Se ve únicamente en la notebook.
                                </p>
                            </div>
                            <div
                                style={{
                                    borderRight: '1px solid #000',
                                    borderBottom: '1px solid #000',
                                    padding: '16px',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 800,
                                        fontSize: '15px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Sólo en 2
                                </div>
                                <p
                                    style={{
                                        margin: '8px 0 0',
                                        fontSize: '12.5px',
                                        lineHeight: 1.5,
                                        color: '#333',
                                    }}
                                >
                                    Se ve únicamente en el monitor externo.
                                </p>
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '22px',
                                marginTop: '20px',
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '10px',
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        color: RED,
                                    }}
                                >
                                    desde el ts
                                </div>
                                <p
                                    style={{
                                        margin: '6px 0 0',
                                        fontSize: '12.5px',
                                        lineHeight: 1.5,
                                        color: '#333',
                                    }}
                                >
                                    No está permitido extender, sólo duplicar.
                                </p>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '10px',
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        color: RED,
                                    }}
                                >
                                    tapa cerrada
                                </div>
                                <p
                                    style={{
                                        margin: '6px 0 0',
                                        fontSize: '12.5px',
                                        lineHeight: 1.5,
                                        color: '#333',
                                    }}
                                >
                                    Config. → Sistema → Energía y batería → «Al
                                    cerrar la tapa» → <b>No hacer nada</b>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 07 · Configuración de sonido */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '0.82fr 1.18fr',
                        gap: 'clamp(24px,4vw,56px)',
                        padding: '34px 0 8px',
                        alignItems: 'center',
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
                            }}
                        >
                            sala de reuniones
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                                marginTop: '12px',
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(40px,5vw,66px)',
                                    lineHeight: 0.78,
                                    letterSpacing: '-0.03em',
                                    color: RED,
                                }}
                            >
                                07
                            </span>
                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: 'clamp(26px,3.3vw,40px)',
                                    lineHeight: 0.92,
                                    letterSpacing: '-0.02em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Config. de
                                <br />
                                sonido
                            </h2>
                        </div>
                    </div>
                    <div style={{ borderTop: '2px solid #000' }}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr',
                                gap: '18px',
                                padding: '15px 0',
                                borderBottom: '1px solid #ececec',
                                fontSize: '14.5px',
                                lineHeight: 1.5,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: '17px',
                                    color: RED,
                                }}
                            >
                                01
                            </span>
                            <span>
                                Conectá el <b>cable de audio</b> y <b>HDMI</b>.
                            </span>
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr',
                                gap: '18px',
                                padding: '15px 0',
                                fontSize: '14.5px',
                                lineHeight: 1.5,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: '17px',
                                    color: RED,
                                }}
                            >
                                02
                            </span>
                            <span>
                                Seleccioná <b>AURICULARES</b>{' '}
                                <span
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontWeight: 700,
                                        color: RED,
                                    }}
                                >
                                    (Realtek(R) Audio)
                                </span>
                                .
                            </span>
                        </div>
                    </div>
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
                    mantiene— IT · Mesa de Información · act. 07·2026
                </div>
            </section>
        </>
    );
}

Mesa.layout = { active: 'mesa', label: 'Mesa de Info—' };
