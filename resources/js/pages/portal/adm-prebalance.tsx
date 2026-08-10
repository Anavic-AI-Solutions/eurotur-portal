import { Head, Link } from '@inertiajs/react';
import type { Workbook } from 'exceljs';
import type { CSSProperties, DragEvent } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type {
    Nivel,
    Periodo,
    ReporteTipo,
    Resultado,
} from '@/lib/prebalance/engine';
import { adm } from '@/routes/portal';

const RED = '#E30613';
const HTML_FALLBACK = '/herramientas/prebalance-modulos.html';
const DOC_URL = '/documentos/prebalance-modulos.docx';

const TIPOS: ReporteTipo[] = ['SyS', 'Tesoreria', 'Compras', 'Ventas'];

const ETIQUETA: Record<ReporteTipo, string> = {
    SyS: 'Sumas y Saldos',
    Tesoreria: 'LXC Tesorería',
    Compras: 'LXC Compras',
    Ventas: 'LXC Ventas',
};

/** ExcelJS pesa ~1 MB: sólo se descarga cuando el usuario carga el primer archivo. */
async function cargarExcelJS() {
    const [ExcelJS, engine, writer] = await Promise.all([
        import('exceljs'),
        import('@/lib/prebalance/engine'),
        import('@/lib/prebalance/writer'),
    ]);

    return { ExcelJS: ExcelJS.default ?? ExcelJS, engine, writer };
}

type Archivo = {
    nombre: string;
    wb: Workbook | null;
    tipo: ReporteTipo | null;
    empresa: string;
};

/* ------------------------------------------------------------------ estilos */

const mono: CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
};

const bloqueStyle: CSSProperties = {
    borderTop: '3px solid #000',
    padding: '14px 0 26px',
};

const inputStyle: CSSProperties = {
    width: '100%',
    fontFamily: "'Archivo', sans-serif",
    fontSize: '13px',
    fontWeight: 500,
    color: '#000',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #000',
    borderRadius: 0,
    padding: '5px 0',
};

const botonStyle: CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    background: 'transparent',
    border: '1px solid #000',
    padding: '9px 14px',
    cursor: 'pointer',
    color: '#000',
};

const NIVEL_STYLE: Record<Nivel, CSSProperties> = {
    OK: { background: '#000', color: '#fff', border: '1px solid #000' },
    ALERTA: { background: '#fff', color: '#000', border: '1px solid #000' },
    ERROR: { background: RED, color: '#fff', border: `1px solid ${RED}` },
    INFO: { background: '#fff', color: '#8a8a8a', border: '1px solid #d9d9d9' },
};

/* -------------------------------------------------------------------- utils */

function fmtNum(n: number): string {
    let v = Math.round(n * 100) / 100;

    if (v === 0) {
        v = 0; // evita mostrar "-0,00"
    }

    return v.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/** Sigla sugerida a partir de la razón social, sin la forma jurídica. */
function siglaDe(empresa: string): string {
    const limpio = empresa
        .replace(/\bS\.?\s?A\.?\s?(C\.?\s?I\.?|I\.?\s?C\.?)?/gi, ' ')
        .replace(/\bS\.?\s?R\.?\s?L\.?/gi, ' ')
        .replace(/\bS\.?\s?A\.?\s?S\.?/gi, ' ')
        .replace(/\bLtda\.?/gi, ' ')
        .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, ' ');
    const partes = limpio.trim().split(/\s+/).filter(Boolean);
    let s = partes
        .map((p) => p.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 3);

    if (s.length < 2 && partes.length) {
        s = partes[0].slice(0, 3).toUpperCase();
    }

    return s;
}

function etiquetasDe(hasta: string) {
    if (!hasta) {
        return { corta: '', larga: '', archivo: '' };
    }

    const p = hasta.split('-');

    return {
        corta: `${p[1]}-${p[0]}`,
        larga: `${p[2]}-${p[1]}-${p[0]}`,
        archivo: `${p[2]}-${p[1]}-${p[0]}`,
    };
}

/* ------------------------------------------------------------------- página */

export default function AdmPrebalance() {
    const [archivos, setArchivos] = useState<Archivo[]>([]);
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [sigla, setSigla] = useState('');
    const [sobreDrop, setSobreDrop] = useState(false);
    const [trabajando, setTrabajando] = useState(false);
    const [estado, setEstado] = useState('Cargá los 4 reportes para comenzar.');
    const [resultado, setResultado] = useState<Resultado | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [blob, setBlob] = useState<Blob | null>(null);

    const inputArchivo = useRef<HTMLInputElement>(null);

    const faltan = useMemo(
        () => TIPOS.filter((t) => !archivos.some((a) => a.tipo === t)),
        [archivos],
    );

    const nombreSalida = useMemo(() => {
        const e = etiquetasDe(hasta);
        // saca los caracteres que Windows no acepta en un nombre de archivo
        const s = sigla.replace(/[\\/:*?"<>|.]/g, '').trim();

        return `Pre-Balance módulos ${e.archivo || 'sin-fecha'}${s ? `_${s}` : ''}.xlsx`;
    }, [hasta, sigla]);

    const limpiarResultado = useCallback(() => {
        setResultado(null);
        setError(null);
        setBlob(null);
    }, []);

    const agregar = useCallback(
        async (fl: FileList | null) => {
            const lista = Array.from(fl ?? []).filter((f) =>
                /\.xlsx?$/i.test(f.name),
            );

            if (!lista.length) {
                setEstado(
                    'Solo se aceptan archivos de Excel (.xlsx) exportados de Tango.',
                );

                return;
            }

            limpiarResultado();
            setTrabajando(true);
            setEstado(`Leyendo ${lista.length} archivo(s)…`);

            const { ExcelJS, engine } = await cargarExcelJS();

            const leidos: Archivo[] = [];
            let min: Date | null = null;
            let max: Date | null = null;

            for (const f of lista) {
                try {
                    const buffer = await f.arrayBuffer();
                    const wb = new ExcelJS.Workbook();
                    await wb.xlsx.load(buffer);
                    const info = engine.identificar(wb);
                    leidos.push({
                        nombre: f.name,
                        wb,
                        tipo: info.tipo,
                        empresa: info.empresa || '',
                    });

                    // rango de fechas real de los LXC, para prellenar el período
                    if (info.tipo && info.tipo !== 'SyS') {
                        try {
                            const m = engine.procesarModulo(info);

                            if (m.fechaMin && (!min || m.fechaMin < min)) {
                                min = m.fechaMin;
                            }

                            if (m.fechaMax && (!max || m.fechaMax > max)) {
                                max = m.fechaMax;
                            }
                        } catch {
                            // el detalle del módulo se revalida al generar
                        }
                    }
                } catch {
                    leidos.push({
                        nombre: f.name,
                        wb: null,
                        tipo: null,
                        empresa: '',
                    });
                }
            }

            setArchivos((previos) => {
                // un archivo nuevo reemplaza al anterior del mismo nombre o tipo
                const nombres = new Set(leidos.map((l) => l.nombre));
                const tipos = new Set(
                    leidos.map((l) => l.tipo).filter(Boolean) as ReporteTipo[],
                );

                return [
                    ...previos.filter(
                        (p) =>
                            !nombres.has(p.nombre) &&
                            !(p.tipo && tipos.has(p.tipo)),
                    ),
                    ...leidos,
                ];
            });

            const emp = leidos.find((l) => l.empresa)?.empresa ?? '';
            setEmpresa((v) => v || emp);
            setSigla((v) => v || (emp ? siglaDe(emp) || 'EMP' : ''));

            if (min) {
                setDesde((v) => v || min.toISOString().slice(0, 10));
            }

            if (max) {
                setHasta((v) => v || max.toISOString().slice(0, 10));
            }

            setTrabajando(false);
            setEstado('Revisá los reportes reconocidos y el período.');
        },
        [limpiarResultado],
    );

    const quitar = useCallback(
        (index: number) => {
            setArchivos((previos) => previos.filter((_, i) => i !== index));
            limpiarResultado();
        },
        [limpiarResultado],
    );

    const descargar = useCallback((b: Blob, nombre: string) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(a.href);
            a.remove();
        }, 2000);
    }, []);

    const generar = useCallback(async () => {
        setTrabajando(true);
        setEstado('Procesando los módulos y armando el Excel…');
        limpiarResultado();

        try {
            const { ExcelJS, engine, writer } = await cargarExcelJS();

            const periodo: Periodo = { desde, hasta };
            const res = engine.procesar(
                archivos
                    .filter((a): a is Archivo & { wb: Workbook } =>
                        Boolean(a.wb && a.tipo),
                    )
                    .map((a) => ({ nombre: a.nombre, wb: a.wb })),
                periodo,
            );

            if (empresa.trim()) {
                res.empresa = empresa.trim();
            }

            const e = etiquetasDe(hasta);
            const wb = writer.construir(ExcelJS, res, {
                periodoTexto: `${(desde || '?').split('-').reverse().join('-')} al ${(hasta || '?').split('-').reverse().join('-')}`,
                etiquetaCorta: e.corta,
                etiquetaLarga: e.larga,
                generado: new Date().toLocaleString('es-AR'),
            });

            const buf = await wb.xlsx.writeBuffer();
            const salida = new Blob([buf], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            setBlob(salida);
            setResultado(res);
            setTrabajando(false);
            setEstado(
                res.hayError
                    ? 'Se generó el Excel pero hay controles en ERROR: revisalos antes de usarlo.'
                    : 'Pre-Balance generado. Si la descarga no arrancó, usá «Descargar Excel».',
            );

            if (!res.hayError) {
                descargar(salida, nombreSalida);
            }
        } catch (err) {
            setTrabajando(false);
            setError(err instanceof Error ? err.message : String(err));
            setEstado('Corregí lo indicado y volvé a intentar.');
        }
    }, [
        archivos,
        desde,
        hasta,
        empresa,
        nombreSalida,
        descargar,
        limpiarResultado,
    ]);

    const reiniciar = useCallback(() => {
        setArchivos([]);
        setDesde('');
        setHasta('');
        setEmpresa('');
        setSigla('');
        limpiarResultado();
        setEstado('Cargá los 4 reportes para comenzar.');
    }, [limpiarResultado]);

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setSobreDrop(false);
        void agregar(e.dataTransfer.files);
    };

    return (
        <>
            <Head title="Pre-Balance de Módulos" />

            <section>
                <Encabezado />

                <Bloque
                    n="01"
                    titulo="Reportes exportados de Tango"
                    nota="No importa el orden ni el nombre: la herramienta reconoce sola cuál es cada uno."
                >
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => inputArchivo.current?.click()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                inputArchivo.current?.click();
                            }
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setSobreDrop(true);
                        }}
                        onDragLeave={() => setSobreDrop(false)}
                        onDrop={onDrop}
                        style={{
                            border: `2px dashed ${sobreDrop ? RED : '#000'}`,
                            background: sobreDrop ? '#faf7f7' : 'transparent',
                            padding: '34px 24px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'border-color .12s, background .12s',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 800,
                                fontSize: '17px',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Arrastrá acá los 4 reportes de Tango
                        </div>
                        <div
                            style={{
                                ...mono,
                                letterSpacing: '0.08em',
                                color: '#666',
                                marginTop: '10px',
                                lineHeight: 1.6,
                            }}
                        >
                            sumas y saldos + listados por imputación contable de
                            tesorería, compras y ventas
                            <br />o hacé clic para buscarlos
                        </div>
                        <input
                            ref={inputArchivo}
                            type="file"
                            multiple
                            accept=".xlsx,.xls"
                            onChange={(e) => {
                                void agregar(e.target.files);
                                e.target.value = '';
                            }}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {archivos.length > 0 && (
                        <TablaArchivos
                            archivos={archivos}
                            faltan={faltan}
                            onQuitar={quitar}
                        />
                    )}

                    <Ayuda />
                </Bloque>

                <Bloque n="02" titulo="Período y empresa">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4,1fr)',
                            gap: '26px',
                        }}
                    >
                        <Campo
                            label="Desde"
                            hint="Inicio del ejercicio contable"
                        >
                            <input
                                type="date"
                                value={desde}
                                onChange={(e) => setDesde(e.target.value)}
                                style={inputStyle}
                            />
                        </Campo>
                        <Campo label="Hasta" hint="Fecha de cierre a revisar">
                            <input
                                type="date"
                                value={hasta}
                                onChange={(e) => setHasta(e.target.value)}
                                style={inputStyle}
                            />
                        </Campo>
                        <Campo
                            label="Empresa"
                            hint="Leída de los propios archivos de Tango"
                        >
                            <input
                                type="text"
                                value={empresa}
                                onChange={(e) => setEmpresa(e.target.value)}
                                placeholder="se detecta de los reportes"
                                style={inputStyle}
                            />
                        </Campo>
                        <Campo
                            label="Sigla para el archivo"
                            hint={`Archivo: ${nombreSalida}`}
                        >
                            <input
                                type="text"
                                value={sigla}
                                maxLength={8}
                                onChange={(e) => setSigla(e.target.value)}
                                placeholder="TD"
                                style={inputStyle}
                            />
                        </Campo>
                    </div>
                </Bloque>

                <Bloque n="03" titulo="Generar">
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => void generar()}
                            disabled={trabajando || faltan.length > 0}
                            style={{
                                ...botonStyle,
                                background:
                                    trabajando || faltan.length > 0
                                        ? '#f6f5f2'
                                        : RED,
                                borderColor:
                                    trabajando || faltan.length > 0
                                        ? '#d9d9d9'
                                        : RED,
                                color:
                                    trabajando || faltan.length > 0
                                        ? '#8a8a8a'
                                        : '#fff',
                                cursor:
                                    trabajando || faltan.length > 0
                                        ? 'not-allowed'
                                        : 'pointer',
                                fontWeight: 700,
                            }}
                        >
                            {trabajando ? 'Procesando…' : 'Generar Pre-Balance'}
                        </button>

                        {blob && (
                            <button
                                type="button"
                                onClick={() => descargar(blob, nombreSalida)}
                                style={botonStyle}
                            >
                                Descargar Excel ↓
                            </button>
                        )}

                        {(archivos.length > 0 || resultado) && (
                            <button
                                type="button"
                                onClick={reiniciar}
                                style={{
                                    ...botonStyle,
                                    borderColor: '#c4c4c4',
                                }}
                            >
                                Empezar de nuevo
                            </button>
                        )}

                        <div
                            style={{
                                ...mono,
                                letterSpacing: '0.06em',
                                textTransform: 'none',
                                color: '#666',
                                marginLeft: 'auto',
                            }}
                        >
                            {estado}
                        </div>
                    </div>

                    {trabajando && (
                        <div
                            style={{
                                height: '3px',
                                marginTop: '14px',
                                backgroundImage:
                                    'repeating-linear-gradient(90deg,#000 0 3px,#fff 3px 9px)',
                            }}
                        />
                    )}
                </Bloque>

                {(resultado || error) && (
                    <Bloque n="04" titulo="Resultado y controles">
                        {error ? (
                            <Aviso nivel="ERROR">
                                <b>No se pudo generar el Pre-Balance.</b>
                                <br />
                                {error}
                            </Aviso>
                        ) : (
                            resultado && <Resultados res={resultado} />
                        )}
                    </Bloque>
                )}

                <Pie />
            </section>
        </>
    );
}

/* --------------------------------------------------------------- secciones */

function Encabezado() {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '40px',
                marginBottom: '30px',
            }}
        >
            <div style={{ maxWidth: '620px' }}>
                <div
                    style={{
                        ...mono,
                        letterSpacing: '0.16em',
                        color: '#666',
                        marginBottom: '12px',
                    }}
                >
                    contabilidad · cierre mensual
                </div>
                <h1
                    style={{
                        fontFamily: "'Anton', sans-serif",
                        fontWeight: 400,
                        fontSize: 'clamp(56px,7.5vw,108px)',
                        lineHeight: 0.86,
                        margin: 0,
                        letterSpacing: '-0.005em',
                    }}
                >
                    Pre-Balance
                    <span style={{ color: RED }}>.</span>
                </h1>
                <p
                    style={{
                        maxWidth: '520px',
                        margin: '18px 0 0',
                        fontSize: '15px',
                        lineHeight: 1.5,
                        fontWeight: 500,
                        color: '#111',
                    }}
                >
                    Arrastrá los 4 reportes de Tango y la herramienta devuelve
                    el Excel del Pre-Balance de Módulos armado, con los 15
                    controles aplicados. Todo corre en tu navegador: los
                    archivos no se suben a ningún lado.
                </p>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '10px',
                }}
            >
                <span
                    style={{
                        ...mono,
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        color: '#fff',
                        background: RED,
                        padding: '5px 9px',
                        whiteSpace: 'nowrap',
                    }}
                >
                    En prueba — Contabilidad
                </span>
                <a href={DOC_URL} className="doc-link" style={enlaceCaja}>
                    documentación ↓
                </a>
                <a
                    href={HTML_FALLBACK}
                    target="_blank"
                    rel="noreferrer"
                    className="doc-link"
                    style={{ ...enlaceCaja, borderColor: '#c4c4c4' }}
                >
                    versión offline ↗
                </a>
                <Link
                    href={adm()}
                    className="doc-link"
                    style={{
                        ...mono,
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        textDecoration: 'none',
                        color: '#666',
                    }}
                >
                    ← volver a administración
                </Link>
            </div>
        </div>
    );
}

const enlaceCaja: CSSProperties = {
    ...mono,
    fontSize: '10px',
    letterSpacing: '0.1em',
    textDecoration: 'none',
    color: '#000',
    border: '1px solid #000',
    padding: '5px 9px',
    whiteSpace: 'nowrap',
};

function Bloque({
    n,
    titulo,
    nota,
    children,
}: {
    n: string;
    titulo: string;
    nota?: string;
    children: React.ReactNode;
}) {
    return (
        <div style={bloqueStyle}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px',
                    marginBottom: '16px',
                }}
            >
                <span
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: 700,
                        fontSize: '11px',
                    }}
                >
                    {n}
                </span>
                <span
                    style={{
                        fontFamily: "'Archivo', sans-serif",
                        fontWeight: 800,
                        fontSize: '19px',
                        letterSpacing: '-0.01em',
                    }}
                >
                    {titulo}
                </span>
                {nota && (
                    <span
                        style={{
                            ...mono,
                            letterSpacing: '0.04em',
                            textTransform: 'none',
                            color: '#999',
                            marginLeft: 'auto',
                        }}
                    >
                        {nota}
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}

function Campo({
    label,
    hint,
    children,
}: {
    label: string;
    hint: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div
                style={{
                    ...mono,
                    fontSize: '9px',
                    letterSpacing: '0.14em',
                    color: '#999',
                    marginBottom: '6px',
                }}
            >
                {label}
            </div>
            {children}
            <div
                style={{
                    ...mono,
                    fontSize: '9px',
                    letterSpacing: '0.04em',
                    textTransform: 'none',
                    color: '#999',
                    marginTop: '6px',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                }}
            >
                {hint}
            </div>
        </div>
    );
}

function TablaArchivos({
    archivos,
    faltan,
    onQuitar,
}: {
    archivos: Archivo[];
    faltan: ReporteTipo[];
    onQuitar: (index: number) => void;
}) {
    return (
        <div style={{ marginTop: '18px' }}>
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '13px',
                }}
            >
                <thead>
                    <tr>
                        {['Archivo', 'Reporte reconocido', ''].map((h, i) => (
                            <th
                                key={h || i}
                                style={{
                                    ...mono,
                                    fontSize: '9px',
                                    letterSpacing: '0.14em',
                                    color: '#999',
                                    textAlign: i === 2 ? 'right' : 'left',
                                    borderBottom: '1px solid #000',
                                    padding: '0 0 7px',
                                    fontWeight: 400,
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {archivos.map((a, i) => (
                        <tr key={`${a.nombre}-${i}`}>
                            <td
                                style={{
                                    padding: '9px 10px 9px 0',
                                    borderBottom: '1px dotted #ccc',
                                    fontWeight: 500,
                                }}
                            >
                                {a.nombre}
                            </td>
                            <td
                                style={{
                                    padding: '9px 0',
                                    borderBottom: '1px dotted #ccc',
                                }}
                            >
                                <span
                                    style={{
                                        ...mono,
                                        fontSize: '9px',
                                        letterSpacing: '0.08em',
                                        padding: '3px 7px',
                                        ...(a.tipo
                                            ? {
                                                  background: '#000',
                                                  color: '#fff',
                                              }
                                            : {
                                                  color: RED,
                                                  border: `1px solid ${RED}`,
                                              }),
                                    }}
                                >
                                    {a.tipo
                                        ? ETIQUETA[a.tipo]
                                        : 'no reconocido'}
                                </span>
                            </td>
                            <td
                                style={{
                                    padding: '9px 0',
                                    borderBottom: '1px dotted #ccc',
                                    textAlign: 'right',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => onQuitar(i)}
                                    title="Quitar"
                                    style={{
                                        all: 'unset',
                                        cursor: 'pointer',
                                        color: RED,
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '11px',
                                    }}
                                >
                                    ✕
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {faltan.length > 0 && (
                <div
                    style={{
                        ...mono,
                        fontSize: '10px',
                        letterSpacing: '0.06em',
                        textTransform: 'none',
                        color: RED,
                        marginTop: '10px',
                    }}
                >
                    Falta cargar:{' '}
                    <b>{faltan.map((t) => ETIQUETA[t]).join(', ')}</b>
                </div>
            )}
        </div>
    );
}

const PASOS: [string, string][] = [
    [
        'Sumas y Saldos',
        'módulo Contabilidad → Informes → Balance. Período del ejercicio. Incluir cuentas con saldo cero y sin movimiento. Exportar a Excel.',
    ],
    [
        'Ventas',
        'Informes → Facturación → Contabilidad → Listado por Imputación Contable. Comprobantes con asiento = Sin exportar.',
    ],
    [
        'Compras',
        'Informes → Comprobantes → Contabilidad → Listado por Imputación Contable. Comprobantes con asiento = Sin exportar.',
    ],
    [
        'Tesorería',
        'Informes → Contabilidad → Listado por Imputación Contable. Comprobantes con asiento = Sin exportar.',
    ],
];

function Ayuda() {
    return (
        <details style={{ marginTop: '18px' }}>
            <summary
                style={{
                    ...mono,
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    color: '#666',
                    cursor: 'pointer',
                }}
            >
                cómo generar los reportes en tango
            </summary>
            <ol
                style={{
                    margin: '14px 0 0',
                    paddingLeft: '18px',
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: '#333',
                }}
            >
                {PASOS.map(([que, como]) => (
                    <li key={que} style={{ marginBottom: '6px' }}>
                        <b>{que}:</b> {como}
                    </li>
                ))}
            </ol>
        </details>
    );
}

function Aviso({
    nivel,
    children,
}: {
    nivel: Nivel;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                display: 'flex',
                gap: '12px',
                padding: '14px 16px',
                marginBottom: '20px',
                background: '#faf9f7',
                borderLeft: `3px solid ${nivel === 'ERROR' ? RED : '#000'}`,
                fontFamily: "'Archivo', sans-serif",
                fontSize: '13.5px',
                lineHeight: 1.5,
            }}
        >
            <span style={{ color: RED, fontWeight: 800 }}>!</span>
            <span>{children}</span>
        </div>
    );
}

function Resultados({ res }: { res: Resultado }) {
    const t = res.cons.totales;
    const nErr = res.validaciones.filter((v) => v.nivel === 'ERROR').length;
    const nAl = res.validaciones.filter((v) => v.nivel === 'ALERTA').length;

    const kpis = [
        {
            et: 'saldo contable final',
            vl: fmtNum(t.saldoContable),
            bien: Math.abs(t.saldoContable) <= 1,
        },
        {
            et: 'cuentas del balance',
            vl: String(res.cons.filas.length),
            bien: true,
        },
        ...(['Tesoreria', 'Compras', 'Ventas'] as const).map((m) => ({
            et: `${m.toLowerCase()} (cierra en 0)`,
            vl: fmtNum(res.mods[m]?.totalNeto ?? 0),
            bien: res.mods[m]?.balancea ?? false,
        })),
    ];

    return (
        <>
            <Aviso nivel={nErr ? 'ERROR' : 'OK'}>
                {nErr ? (
                    <>
                        <b>{nErr} control(es) en ERROR.</b> El Pre-Balance se
                        generó igual, pero hay que corregir el origen en Tango
                        antes de usarlo.
                    </>
                ) : nAl ? (
                    <>
                        <b>Todos los controles de cero cerraron.</b> Hay {nAl}{' '}
                        alerta(s) para revisar en el detalle.
                    </>
                ) : (
                    <>
                        <b>Todos los controles pasaron.</b> Los tres módulos
                        cierran en cero y todas las cuentas cruzaron contra el
                        Sumas y Saldos.
                    </>
                )}
            </Aviso>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5,1fr)',
                    borderTop: '1px solid #000',
                    borderBottom: '1px solid #000',
                    marginBottom: '24px',
                }}
            >
                {kpis.map((k) => (
                    <div
                        key={k.et}
                        style={{
                            padding: '14px 16px 16px',
                            borderRight: '1px dotted #000',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 900,
                                fontSize: '26px',
                                lineHeight: 1,
                                color: k.bien ? '#000' : RED,
                            }}
                        >
                            {k.vl}
                        </div>
                        <div
                            style={{
                                ...mono,
                                fontSize: '9px',
                                letterSpacing: '0.12em',
                                color: '#666',
                                marginTop: '8px',
                            }}
                        >
                            {k.et}
                        </div>
                    </div>
                ))}
            </div>

            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '13px',
                }}
            >
                <thead>
                    <tr>
                        {['Control', 'Resultado', 'Detalle'].map((h) => (
                            <th
                                key={h}
                                style={{
                                    ...mono,
                                    fontSize: '9px',
                                    letterSpacing: '0.14em',
                                    color: '#999',
                                    textAlign: 'left',
                                    borderBottom: '1px solid #000',
                                    padding: '0 10px 7px 0',
                                    fontWeight: 400,
                                    width:
                                        h === 'Control'
                                            ? '25%'
                                            : h === 'Resultado'
                                              ? '90px'
                                              : 'auto',
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {res.validaciones.map((v) => (
                        <tr key={v.control}>
                            <td style={celdaStyle}>
                                <b>{v.control}</b>
                            </td>
                            <td style={celdaStyle}>
                                <span
                                    style={{
                                        ...mono,
                                        fontSize: '9px',
                                        letterSpacing: '0.08em',
                                        padding: '3px 7px',
                                        display: 'inline-block',
                                        ...NIVEL_STYLE[v.nivel],
                                    }}
                                >
                                    {v.nivel}
                                </span>
                            </td>
                            <td style={{ ...celdaStyle, color: '#444' }}>
                                {v.detalle}
                            </td>
                        </tr>
                    ))}
                    {res.avisos.map((a) => (
                        <tr key={a}>
                            <td style={celdaStyle}>
                                <b>Aviso</b>
                            </td>
                            <td style={celdaStyle}>
                                <span
                                    style={{
                                        ...mono,
                                        fontSize: '9px',
                                        letterSpacing: '0.08em',
                                        padding: '3px 7px',
                                        display: 'inline-block',
                                        ...NIVEL_STYLE.INFO,
                                    }}
                                >
                                    INFO
                                </span>
                            </td>
                            <td style={{ ...celdaStyle, color: '#444' }}>
                                {a}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

const celdaStyle: CSSProperties = {
    padding: '10px 10px 10px 0',
    borderBottom: '1px dotted #ccc',
    verticalAlign: 'top',
    lineHeight: 1.45,
};

function Pie() {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                marginTop: '20px',
                borderTop: '1px solid #000',
                paddingTop: '14px',
            }}
        >
            <div
                style={{
                    ...mono,
                    letterSpacing: '0.04em',
                    textTransform: 'none',
                    color: '#999',
                }}
            >
                Los archivos se procesan en esta misma computadora y no se
                envían a ningún servidor.
            </div>
            <div style={{ ...mono, color: '#666', whiteSpace: 'nowrap' }}>
                mantiene— Quintana, Elsa · Basualdo, N. · act. 07·2026
            </div>
        </div>
    );
}

AdmPrebalance.layout = { active: 'adm', label: 'Pre-Balance—' };
