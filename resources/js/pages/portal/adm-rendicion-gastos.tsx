import { Head, Link } from '@inertiajs/react';
import type { CSSProperties, WheelEvent } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import ReceiptOcrController from '@/actions/App/Http/Controllers/Portal/ReceiptOcrController';
import {
    COMPANY_CODES,
    FORMAS_PAGO,
    LETRAS_FACTURA,
    MAX_GASTOS,
    MONEDAS_ISO,
    TIPOS_GASTO,
    cuitCheck,
    fileNumeroValido,
    fmtByMoneda,
    fmtMoney,
    gastoMoneda,
    gastoTotal,
    nuevoGasto,
    validarPaso1,
    validarPaso2,
} from '@/lib/rendicion/engine';
import type { Gasto, Header, RendicionTipo } from '@/lib/rendicion/engine';
import { adm } from '@/routes/portal';

const RED = '#E30613';
const GREEN = '#22c55e';
const YELLOW = '#d9a10a';
const HTML_FALLBACK = '/herramientas/rendicion-gastos.html';
const DOC_URL = '/documentos/rendicion-gastos-manual.docx';

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

const selectStyle: CSSProperties = { ...inputStyle, cursor: 'pointer' };

/** Returns border-bottom color for a field: GREEN=filled ok, YELLOW=empty required, RED=invalid, default=#000. */
function campoBorde(
    value: string,
    opts?: { required?: boolean; invalid?: boolean },
): string {
    if (opts?.invalid) {
        return RED;
    }

    if (value) {
        return GREEN;
    }

    if (opts?.required) {
        return YELLOW;
    }

    return '#000';
}

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

/* ---------------------------------------------------------------- imágenes */

async function procesarImagen(file: File) {
    const { procesarComprobante } = await import('@/lib/rendicion/images');

    return procesarComprobante(file);
}

/* ------------------------------------------------------------------- OCR */

type OcrMensaje = {
    codigo: string;
    nivel: 'info' | 'advertencia' | 'error';
    texto: string;
    campos: string[];
};

type OcrResultado = {
    tipo_documento: string;
    legibilidad: string;
    moneda_tipo: 'ARS' | 'EXTRANJERA' | null;
    fecha: string | null;
    proveedor: string | null;
    cuit: string | null;
    letra_factura: string | null;
    talonario: string | null;
    numero_comprobante: string | null;
    importe_neto: number | null;
    importe_total: number | null;
    iva_27: number | null;
    iva_21: number | null;
    iva_105: number | null;
    percepcion_iva: number | null;
    percepcion_iibb_caba: number | null;
    percepcion_iibb_sc: number | null;
    percepcion_iibb_tdf: number | null;
    moneda_iso: string | null;
    importe_original: number | null;
    confidence: number;
    raw_text: string;
    estado_lectura: 'ALTA' | 'MEDIA' | 'BAJA' | 'SIN_LECTURA';
    campos_faltantes: string[];
    mensajes: OcrMensaje[];
};

function getXsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
    return (await fetch(dataUrl)).blob();
}

/** Convierte un número/string en el string con el que trabaja `Gasto` (sin ceros de más ni "0" para valores nulos/cero). */
function numeroAGasto(valor: number | null): string {
    if (valor === null || valor === 0) {
        return '';
    }

    return String(valor);
}

/**
 * Best-effort: manda la imagen ya comprimida al endpoint de OCR y devuelve
 * el patch a aplicar sobre el `Gasto`, más los mensajes para mostrar. Nunca
 * lanza — cualquier falla se resuelve como "no se pudo leer, completá a mano".
 */
async function leerComprobante(
    comprobanteImage: NonNullable<Gasto['comprobante_image']>,
    monedaTipo: RendicionTipo,
): Promise<{ patch: Partial<Gasto>; resultado: OcrResultado | null }> {
    try {
        const blob = await dataUrlToBlob(comprobanteImage.dataUrl);
        const formData = new FormData();
        formData.append('image', blob, 'comprobante.jpg');

        const response = await fetch(ReceiptOcrController().url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-XSRF-TOKEN': getXsrfToken(),
            },
            body: formData,
            credentials: 'same-origin',
        });

        if (!response.ok) {
            return { patch: {}, resultado: null };
        }

        const resultado = (await response.json()) as OcrResultado;

        if (resultado.confidence === 0) {
            return { patch: {}, resultado };
        }

        const patch: Partial<Gasto> = {
            fecha: resultado.fecha ?? undefined,
            proveedor: resultado.proveedor ?? undefined,
        };

        if (monedaTipo === 'ARS') {
            Object.assign(patch, {
                cuit: resultado.cuit ?? undefined,
                letra_factura: resultado.letra_factura ?? undefined,
                talonario: resultado.talonario ?? undefined,
                numero_comprobante: resultado.numero_comprobante ?? undefined,
                // Comprobantes sin desglose fiscal (ej. transferencias) no
                // traen "neto" — no hay IVA que restarle al total. En ese
                // caso el total leído cubre el mismo campo (con las IVAs en
                // blanco, gastoTotal() da el mismo importe).
                importe_neto:
                    resultado.importe_neto !== null
                        ? numeroAGasto(resultado.importe_neto)
                        : resultado.importe_total !== null
                          ? numeroAGasto(resultado.importe_total)
                          : undefined,
                iva_27:
                    resultado.iva_27 !== null
                        ? numeroAGasto(resultado.iva_27)
                        : undefined,
                iva_21:
                    resultado.iva_21 !== null
                        ? numeroAGasto(resultado.iva_21)
                        : undefined,
                iva_105:
                    resultado.iva_105 !== null
                        ? numeroAGasto(resultado.iva_105)
                        : undefined,
                percepcion_iva:
                    resultado.percepcion_iva !== null
                        ? numeroAGasto(resultado.percepcion_iva)
                        : undefined,
                percepcion_iibb_caba:
                    resultado.percepcion_iibb_caba !== null
                        ? numeroAGasto(resultado.percepcion_iibb_caba)
                        : undefined,
                percepcion_iibb_sc:
                    resultado.percepcion_iibb_sc !== null
                        ? numeroAGasto(resultado.percepcion_iibb_sc)
                        : undefined,
                percepcion_iibb_tdf:
                    resultado.percepcion_iibb_tdf !== null
                        ? numeroAGasto(resultado.percepcion_iibb_tdf)
                        : undefined,
            });
        } else {
            Object.assign(patch, {
                moneda_iso: resultado.moneda_iso ?? undefined,
                importe_original:
                    resultado.importe_original !== null
                        ? numeroAGasto(resultado.importe_original)
                        : undefined,
            });
        }

        // Quitar claves undefined: no queremos pisar lo que la persona ya tipeó con "nada".
        const patchLimpio = Object.fromEntries(
            Object.entries(patch).filter(([, v]) => v !== undefined),
        ) as Partial<Gasto>;

        return { patch: patchLimpio, resultado };
    } catch {
        return { patch: {}, resultado: null };
    }
}

async function generar(
    header: Header,
    gastos: Gasto[],
    rendicionTipo: RendicionTipo,
) {
    const { generarExcel } = await import('@/lib/rendicion/writer');

    return generarExcel(header, gastos, rendicionTipo);
}

/* -------------------------------------------------------------------- page */

type Paso = 1 | 2 | 3;

export default function AdmRendicionGastos() {
    const [paso, setPaso] = useState<Paso>(1);
    const [rendicionTipo, setRendicionTipo] = useState<RendicionTipo>('ARS');
    const [empresa, setEmpresa] = useState<Header['empresa']>('Euro_Arg');
    const [numeroRendicion, setNumeroRendicion] = useState('1');
    const [nombreApellido, setNombreApellido] = useState('');
    const [iniciales, setIniciales] = useState('');
    const [fechaGasto, setFechaGasto] = useState('');
    const [conceptoRendicion, setConceptoRendicion] = useState('');
    const [tipoCambioGeneral, setTipoCambioGeneral] = useState('');

    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [gastoIdCounter, setGastoIdCounter] = useState(0);

    const [errores, setErrores] = useState<string[]>([]);
    const [generando, setGenerando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultado, setResultado] = useState<{
        filename: string;
        conImagenes: number;
    } | null>(null);

    const header = useMemo<Header>(
        () => ({
            empresa,
            nombre_apellido: nombreApellido.trim(),
            iniciales: iniciales.trim().toUpperCase(),
            fecha_gasto: fechaGasto,
            concepto_rendicion: conceptoRendicion.trim(),
            numero_rendicion: parseInt(numeroRendicion || '1', 10),
            tipo_cambio_general: parseFloat(tipoCambioGeneral || '0'),
        }),
        [
            empresa,
            nombreApellido,
            iniciales,
            fechaGasto,
            conceptoRendicion,
            numeroRendicion,
            tipoCambioGeneral,
        ],
    );

    const setRendicionTipoConfirmado = useCallback(
        (value: RendicionTipo) => {
            if (gastos.length > 0) {
                const ok = confirm(
                    'Cambiar el tipo de rendición borra los gastos que ya cargaste (una rendición es de un solo tipo de moneda). ¿Continuar?',
                );

                if (!ok) {
                    return;
                }

                setGastos([]);
            }

            setRendicionTipo(value);
        },
        [gastos.length],
    );

    const addGasto = useCallback(() => {
        if (gastos.length >= MAX_GASTOS) {
            alert(
                `Llegaste al máximo de ${MAX_GASTOS} comprobantes por rendición.`,
            );

            return;
        }

        setGastos((prev) => [
            ...prev,
            nuevoGasto(gastoIdCounter, rendicionTipo),
        ]);
        setGastoIdCounter((n) => n + 1);
    }, [gastos.length, gastoIdCounter, rendicionTipo]);

    const removeGasto = useCallback((id: number) => {
        setGastos((prev) => prev.filter((g) => g.id !== id));
    }, []);

    const updateGasto = useCallback((id: number, patch: Partial<Gasto>) => {
        setGastos((prev) =>
            prev.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        );
    }, []);

    const irAPaso = useCallback(
        (n: Paso) => {
            if (n === 2) {
                const errs = validarPaso1(header, rendicionTipo);

                if (errs.length > 0) {
                    setErrores(errs);

                    return;
                }
            }

            if (n === 3) {
                const errs = validarPaso2(gastos);

                if (errs.length > 0) {
                    setErrores(errs);

                    return;
                }
            }

            setErrores([]);
            setPaso(n);
            window.scrollTo(0, 0);
        },
        [header, rendicionTipo, gastos],
    );

    const totalArs = gastos
        .filter((g) => g.monedaTipo !== 'EXTRANJERA')
        .reduce((s, g) => s + gastoTotal(g), 0);
    const totalUsd = gastos
        .filter((g) => g.monedaTipo === 'EXTRANJERA')
        .reduce((s, g) => s + gastoTotal(g), 0);

    const onGenerar = useCallback(async () => {
        setGenerando(true);
        setError(null);

        try {
            const res = await generar(header, gastos, rendicionTipo);
            const url = URL.createObjectURL(res.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = res.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setResultado({
                filename: res.filename,
                conImagenes: res.conImagenes,
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setGenerando(false);
        }
    }, [header, gastos, rendicionTipo]);

    return (
        <>
            <Head title="Rendición de Gastos" />

            <style>{`
                @keyframes ocr-spin { to { transform: rotate(360deg); } }
                .ocr-spinner {
                    display: inline-block;
                    width: 11px;
                    height: 11px;
                    border: 2px solid #ccc;
                    border-top-color: #000;
                    border-radius: 50%;
                    animation: ocr-spin 0.7s linear infinite;
                }
            `}</style>

            <section>
                <Encabezado />

                {errores.length > 0 && (
                    <Aviso>
                        <b>Antes de seguir, revisá esto:</b>
                        <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                            {errores.map((e) => (
                                <li key={e}>{e}</li>
                            ))}
                        </ul>
                    </Aviso>
                )}

                <Pasos paso={paso} />

                {paso === 1 && (
                    <Bloque n="01" titulo="Datos generales de la rendición">
                        <div style={{ display: 'grid', gap: '22px' }}>
                            <Campo
                                label="¿Esta rendición es en pesos o en moneda extranjera?"
                                hint="Toda la rendición se carga en un solo tipo de moneda. Si tenés gastos de los dos tipos, hacé dos rendiciones separadas."
                            >
                                <select
                                    value={rendicionTipo}
                                    onChange={(e) =>
                                        setRendicionTipoConfirmado(
                                            e.target.value as RendicionTipo,
                                        )
                                    }
                                    style={selectStyle}
                                >
                                    <option value="ARS">En pesos (ARS)</option>
                                    <option value="EXTRANJERA">
                                        En moneda extranjera (viajes,
                                        USD/EUR/etc)
                                    </option>
                                </select>
                            </Campo>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2,1fr)',
                                    gap: '22px',
                                }}
                            >
                                <Campo label="Empresa" hint="">
                                    <select
                                        value={empresa}
                                        onChange={(e) =>
                                            setEmpresa(
                                                e.target
                                                    .value as Header['empresa'],
                                            )
                                        }
                                        style={selectStyle}
                                    >
                                        {Object.keys(COMPANY_CODES).map((e) => (
                                            <option key={e} value={e}>
                                                {e.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </Campo>
                                <Campo
                                    label="Número de rendición"
                                    hint="Si es la primera rendición que cargás con este panel, dejá 1. Si ya mandaste otras antes, seguí la numeración."
                                >
                                    <input
                                        type="number"
                                        min={1}
                                        value={numeroRendicion}
                                        onChange={(e) =>
                                            setNumeroRendicion(e.target.value)
                                        }
                                        onWheel={(e) => e.preventDefault()}
                                        style={inputStyle}
                                    />
                                </Campo>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2,1fr)',
                                    gap: '22px',
                                }}
                            >
                                <Campo label="Nombre y apellido" hint="">
                                    <input
                                        type="text"
                                        value={nombreApellido}
                                        onChange={(e) =>
                                            setNombreApellido(e.target.value)
                                        }
                                        placeholder="Ej: Juan Pérez"
                                        style={inputStyle}
                                    />
                                </Campo>
                                <Campo
                                    label="Iniciales"
                                    hint="Inicial de tu nombre + inicial de tu apellido (2 a 3 letras). Ej: Juan Pérez → JP"
                                >
                                    <input
                                        type="text"
                                        maxLength={3}
                                        value={iniciales}
                                        onChange={(e) =>
                                            setIniciales(e.target.value)
                                        }
                                        placeholder="Ej: JP"
                                        style={inputStyle}
                                    />
                                </Campo>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2,1fr)',
                                    gap: '22px',
                                }}
                            >
                                <Campo label="Fecha del viaje / gasto" hint="">
                                    <input
                                        type="date"
                                        value={fechaGasto}
                                        onChange={(e) =>
                                            setFechaGasto(e.target.value)
                                        }
                                        style={inputStyle}
                                    />
                                </Campo>
                                {rendicionTipo === 'EXTRANJERA' && (
                                    <Campo
                                        label="Tipo de cambio (dólar a pesos, a la fecha de la rendición)"
                                        hint="Necesario porque elegiste 'moneda extranjera' arriba."
                                    >
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={tipoCambioGeneral}
                                            onChange={(e) =>
                                                setTipoCambioGeneral(
                                                    e.target.value,
                                                )
                                            }
                                            onWheel={(e) => e.preventDefault()}
                                            placeholder="Ej: 1500"
                                            style={inputStyle}
                                        />
                                    </Campo>
                                )}
                            </div>

                            <Campo
                                label="Concepto general de la rendición"
                                hint="Un resumen corto para identificar la rendición de un vistazo (no tiene que ser exacto ni técnico)."
                            >
                                <input
                                    type="text"
                                    value={conceptoRendicion}
                                    onChange={(e) =>
                                        setConceptoRendicion(e.target.value)
                                    }
                                    placeholder="Ej: Gastos de viaje a Iguazú / Gastos varios de oficina julio"
                                    style={inputStyle}
                                />
                            </Campo>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginTop: '22px',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => irAPaso(2)}
                                style={{
                                    ...botonStyle,
                                    background: RED,
                                    borderColor: RED,
                                    color: '#fff',
                                    fontWeight: 700,
                                }}
                            >
                                Siguiente: cargar gastos →
                            </button>
                        </div>
                    </Bloque>
                )}

                {paso === 2 && (
                    <Bloque
                        n="02"
                        titulo="Gastos"
                        nota={`${gastos.length} de ${MAX_GASTOS} comprobantes cargados`}
                    >
                        {gastos.map((g, idx) => (
                            <GastoCard
                                key={g.id}
                                gasto={g}
                                idx={idx}
                                onUpdate={(patch) => updateGasto(g.id, patch)}
                                onRemove={() => removeGasto(g.id)}
                            />
                        ))}

                        <button
                            type="button"
                            onClick={addGasto}
                            style={botonStyle}
                        >
                            + Agregar otro gasto
                        </button>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '22px',
                                borderTop: '1px solid #000',
                                paddingTop: '14px',
                            }}
                        >
                            <span style={{ ...mono, color: '#666' }}>
                                {gastos.length} de {MAX_GASTOS} comprobantes
                                cargados
                            </span>
                            <strong
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontSize: '17px',
                                }}
                            >
                                Total: {fmtMoney(totalArs)}
                                {totalUsd > 0 && (
                                    <>
                                        {' '}
                                        &nbsp;+&nbsp;{' '}
                                        {fmtByMoneda(totalUsd, 'USD')}
                                    </>
                                )}
                            </strong>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '20px',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => irAPaso(1)}
                                style={botonStyle}
                            >
                                ← Volver
                            </button>
                            <button
                                type="button"
                                onClick={() => irAPaso(3)}
                                style={{
                                    ...botonStyle,
                                    background: RED,
                                    borderColor: RED,
                                    color: '#fff',
                                    fontWeight: 700,
                                }}
                            >
                                Siguiente: revisar →
                            </button>
                        </div>
                    </Bloque>
                )}

                {paso === 3 && (
                    <Bloque n="03" titulo="Revisión final">
                        <Resumen
                            header={header}
                            gastos={gastos}
                            totalArs={totalArs}
                            totalUsd={totalUsd}
                        />

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '20px',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => irAPaso(2)}
                                style={botonStyle}
                            >
                                ← Volver
                            </button>
                            <button
                                type="button"
                                onClick={() => void onGenerar()}
                                disabled={generando}
                                style={{
                                    ...botonStyle,
                                    background: generando ? '#f6f5f2' : RED,
                                    borderColor: generando ? '#d9d9d9' : RED,
                                    color: generando ? '#8a8a8a' : '#fff',
                                    cursor: generando
                                        ? 'not-allowed'
                                        : 'pointer',
                                    fontWeight: 700,
                                }}
                            >
                                {generando ? 'Generando...' : 'Generar Excel ✓'}
                            </button>
                        </div>

                        {error && (
                            <Aviso>
                                Ocurrió un error generando el archivo: {error}
                            </Aviso>
                        )}

                        {resultado && (
                            <div
                                style={{
                                    marginTop: '18px',
                                    border: '1px solid #000',
                                    padding: '20px',
                                    textAlign: 'center',
                                }}
                            >
                                <b>✓ Archivo generado</b>
                                <p style={{ margin: '8px 0 0' }}>
                                    Se descargó{' '}
                                    <strong>{resultado.filename}</strong>, ya
                                    completo y con las validaciones correctas.
                                </p>
                                <p
                                    style={{
                                        ...mono,
                                        textTransform: 'none',
                                        color: '#666',
                                        marginTop: '8px',
                                    }}
                                >
                                    {resultado.conImagenes > 0
                                        ? `${resultado.conImagenes} comprobante(s) insertado(s) en la hoja de comprobantes.`
                                        : 'No te olvides de adjuntar los comprobantes escaneados (como siempre) antes de mandarlo a Tesorería.'}
                                </p>
                            </div>
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
                    cuentas a pagar
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
                    Rendición de Gastos
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
                    Cargá tus gastos (en pesos o en moneda extranjera) con
                    lenguaje simple. Al final se genera el Excel oficial ya
                    completo, listo para mandar a Tesorería. Hasta {MAX_GASTOS}{' '}
                    comprobantes por rendición — no mezcla ARS con moneda
                    extranjera.
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
                    En prueba — Cuentas a pagar
                </span>
                <a href={DOC_URL} className="doc-link" style={enlaceCaja}>
                    manual de uso ↓
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
                <div
                    style={{
                        ...mono,
                        fontSize: '9px',
                        letterSpacing: '0.04em',
                        textTransform: 'none',
                        color: '#999',
                        maxWidth: '160px',
                        textAlign: 'right',
                    }}
                >
                    Descargá el .html antes de abrirlo: si se abre directo desde
                    el mail o Drive, puede no cargar.
                </div>
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

function Pasos({ paso }: { paso: Paso }) {
    const items: { n: Paso; label: string }[] = [
        { n: 1, label: '1. Datos generales' },
        { n: 2, label: '2. Gastos' },
        { n: 3, label: '3. Revisar y generar' },
    ];

    return (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {items.map((it) => (
                <div
                    key={it.n}
                    style={{
                        ...mono,
                        flex: 1,
                        textAlign: 'center',
                        padding: '8px 4px',
                        border: '1px solid #000',
                        background:
                            it.n === paso
                                ? RED
                                : it.n < paso
                                  ? '#fdeceb'
                                  : 'transparent',
                        color:
                            it.n === paso ? '#fff' : it.n < paso ? RED : '#666',
                    }}
                >
                    {it.label}
                </div>
            ))}
        </div>
    );
}

function Aviso({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                background: '#fdeceb',
                border: `1px solid ${RED}`,
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '13px',
                color: RED,
            }}
        >
            {children}
        </div>
    );
}

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
            {hint && (
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
            )}
        </div>
    );
}

function GastoCard({
    gasto: g,
    idx,
    onUpdate,
    onRemove,
}: {
    gasto: Gasto;
    idx: number;
    onUpdate: (patch: Partial<Gasto>) => void;
    onRemove: () => void;
}) {
    const formaPagoInfo = FORMAS_PAGO.find((f) => f.value === g.forma_pago);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const cuitEstado: 'vacio' | 'valido' | 'invalido' = g.cuit
        ? cuitCheck(g.cuit)
            ? 'valido'
            : 'invalido'
        : 'vacio';

    const blockScroll = useCallback((e: WheelEvent) => {
        e.preventDefault();
    }, []);

    return (
        <div
            style={{
                border: '1px solid #000',
                padding: '20px',
                marginBottom: '18px',
                position: 'relative',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '12px',
                }}
            >
                <span
                    style={{
                        ...mono,
                        background: RED,
                        color: '#fff',
                        padding: '2px 8px',
                    }}
                >
                    Gasto {idx + 1}
                </span>
                <button
                    type="button"
                    onClick={onRemove}
                    style={{
                        ...mono,
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                    }}
                >
                    Eliminar
                </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                <ComprobanteInput gasto={g} onUpdate={onUpdate} />

                <Campo label="¿Es de un file/proyecto específico?" hint="">
                    <select
                        value={g.esFile ? 'true' : 'false'}
                        onChange={(e) => {
                            const esFile = e.target.value === 'true';
                            onUpdate(
                                esFile
                                    ? { esFile, tipo_gasto: '' }
                                    : { esFile, file_numero: '' },
                            );
                        }}
                        style={selectStyle}
                    >
                        <option value="false">No, es un gasto general</option>
                        <option value="true">Sí, tiene número de file</option>
                    </select>
                </Campo>

                {g.esFile && (
                    <Campo
                        label={`Número de file ${g.file_numero ? (fileNumeroValido(g.file_numero) ? '(formato OK)' : '(formato incorrecto)') : ''}`}
                        hint="4 letras mayúsculas + 6 números."
                    >
                        <input
                            type="text"
                            value={g.file_numero}
                            placeholder="Ej: EAPR252982"
                            style={{
                                ...inputStyle,
                                textTransform: 'uppercase',
                            }}
                            onChange={(e) =>
                                onUpdate({
                                    file_numero: e.target.value.toUpperCase(),
                                })
                            }
                        />
                    </Campo>
                )}

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2,1fr)',
                        gap: '16px',
                    }}
                >
                    <Campo label="Fecha del gasto" hint="">
                        <input
                            type="date"
                            value={g.fecha}
                            onChange={(e) =>
                                onUpdate({ fecha: e.target.value })
                            }
                            style={{
                                ...inputStyle,
                                transition: 'border-color 0.2s ease',
                                borderBottomColor: campoBorde(g.fecha, { required: true }),
                            }}
                        />
                    </Campo>
                    <Campo label="Proveedor / Razón social" hint="">
                        <input
                            type="text"
                            value={g.proveedor}
                            placeholder="Tal como figura en el comprobante"
                            onChange={(e) =>
                                onUpdate({ proveedor: e.target.value })
                            }
                            style={{
                                ...inputStyle,
                                transition: 'border-color 0.2s ease',
                                borderBottomColor: campoBorde(g.proveedor, { required: true }),
                            }}
                        />
                    </Campo>
                </div>

                {g.monedaTipo === 'EXTRANJERA' ? (
                    <CamposExtranjera g={g} onUpdate={onUpdate} blockScroll={blockScroll} />
                ) : (
                    <CamposArs
                        g={g}
                        onUpdate={onUpdate}
                        fieldErrors={fieldErrors}
                        setFieldErrors={setFieldErrors}
                        cuitEstado={cuitEstado}
                        blockScroll={blockScroll}
                    />
                )}

                <Campo
                    label="Forma de pago"
                    hint={
                        formaPagoInfo
                            ? `Cuenta contable: ${formaPagoInfo.cuenta}`
                            : ''
                    }
                >
                    <select
                        value={g.forma_pago}
                        onChange={(e) =>
                            onUpdate({ forma_pago: e.target.value })
                        }
                        style={selectStyle}
                    >
                        <option value="">Elegir...</option>
                        {FORMAS_PAGO.map((f) => (
                            <option key={f.value} value={f.value}>
                                {f.label}
                            </option>
                        ))}
                    </select>
                </Campo>

                <div
                    style={{
                        textAlign: 'right',
                        ...mono,
                        textTransform: 'none',
                        fontWeight: 700,
                    }}
                >
                    Subtotal: {fmtByMoneda(gastoTotal(g), gastoMoneda(g))}
                </div>
            </div>
        </div>
    );
}

function CamposArs({
    g,
    onUpdate,
    fieldErrors,
    setFieldErrors,
    cuitEstado,
    blockScroll,
}: {
    g: Gasto;
    onUpdate: (patch: Partial<Gasto>) => void;
    fieldErrors: Record<string, string>;
    setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    cuitEstado: 'vacio' | 'valido' | 'invalido';
    blockScroll: (e: WheelEvent) => void;
}) {
    return (
        <>
            {!g.esFile && (
                <Campo label="Tipo de gasto" hint="">
                    <select
                        value={g.tipo_gasto}
                        onChange={(e) =>
                            onUpdate({ tipo_gasto: e.target.value })
                        }
                        style={selectStyle}
                    >
                        <option value="">Elegir...</option>
                        {TIPOS_GASTO.map((t) => (
                            <option key={t} value={t}>
                                {t.trim()}
                            </option>
                        ))}
                    </select>
                </Campo>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2,1fr)',
                    gap: '16px',
                }}
            >
                <Campo
                    label="CUIT del proveedor"
                    hint="Sin guiones, 11 dígitos"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                            aria-hidden="true"
                            style={{
                                fontSize: '14px',
                                lineHeight: 1,
                                color:
                                    cuitEstado === 'valido'
                                        ? '#22c55e'
                                        : cuitEstado === 'invalido'
                                          ? RED
                                          : '#9ca3af',
                                flexShrink: 0,
                                userSelect: 'none',
                            }}
                        >
                            ●
                        </span>
                        <input
                            type="text"
                            maxLength={11}
                            value={g.cuit}
                            disabled={g.sinComprobante}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                onUpdate({ cuit: val });

                                if (val && !fieldErrors.cuit) {
                                    setFieldErrors((prev) => {
                                        const next = { ...prev };
                                        delete next.cuit;

                                        return next;
                                    });
                                }
                            }}
                            onBlur={() => {
                                if (!g.cuit && !g.sinComprobante) {
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        cuit: 'Falta el CUIT.',
                                    }));
                                } else if (g.cuit && !cuitCheck(g.cuit)) {
                                    setFieldErrors((prev) => ({
                                        ...prev,
                                        cuit: 'El CUIT ingresado no es válido.',
                                    }));
                                } else {
                                    setFieldErrors((prev) => {
                                        const next = { ...prev };
                                        delete next.cuit;

                                        return next;
                                    });
                                }
                            }}
                            onWheel={blockScroll}
                            style={{
                                ...inputStyle,
                                transition: 'border-color 0.2s ease',
                                borderBottomColor: g.sinComprobante
                                    ? '#000'
                                    : campoBorde(g.cuit, {
                                          required: true,
                                          invalid:
                                              g.cuit.length > 0 &&
                                              cuitEstado === 'invalido',
                                      }),
                            }}
                        />
                    </div>
                    {fieldErrors.cuit && (
                        <div
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontSize: '11px',
                                fontWeight: 600,
                                color: RED,
                                marginTop: '5px',
                            }}
                        >
                            {fieldErrors.cuit}
                        </div>
                    )}
                </Campo>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '22px',
                    }}
                >
                    <input
                        type="checkbox"
                        id={`sc-${g.id}`}
                        checked={g.sinComprobante}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            onUpdate(
                                checked
                                    ? {
                                          sinComprobante: true,
                                          cuit: '',
                                          letra_factura: 'SC',
                                          talonario: '',
                                          numero_comprobante: '',
                                          iva_27: '',
                                          iva_21: '',
                                          iva_105: '',
                                          percepcion_iva: '',
                                          percepcion_iibb_caba: '',
                                          percepcion_iibb_sc: '',
                                          percepcion_iibb_tdf: '',
                                          otros_cargos: '',
                                      }
                                    : {
                                          sinComprobante: false,
                                          letra_factura:
                                              g.letra_factura === 'SC'
                                                  ? ''
                                                  : g.letra_factura,
                                      },
                            );
                        }}
                    />
                    <label htmlFor={`sc-${g.id}`} style={{ fontSize: '13px' }}>
                        No tengo comprobante válido / el CUIT no es válido
                    </label>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: g.sinComprobante
                        ? '1fr'
                        : 'repeat(3,1fr)',
                    gap: '16px',
                }}
            >
                <Campo label="Tipo de factura" hint="">
                    <select
                        disabled={g.sinComprobante}
                        value={g.letra_factura}
                        onChange={(e) =>
                            onUpdate({ letra_factura: e.target.value })
                        }
                        style={{
                            ...selectStyle,
                            transition: 'border-color 0.2s ease',
                            borderBottomColor: g.sinComprobante
                                ? '#000'
                                : campoBorde(g.letra_factura, { required: true }),
                        }}
                    >
                        <option value="">Elegir...</option>
                        {LETRAS_FACTURA.filter((l) =>
                            !g.sinComprobante ? l.value !== 'SC' : true,
                        ).map((l) => (
                            <option key={l.value} value={l.value}>
                                {l.label}
                            </option>
                        ))}
                    </select>
                </Campo>
                {!g.sinComprobante && (
                    <>
                        <Campo label="Talonario (punto de venta)" hint="">
                            <input
                                type="text"
                                maxLength={5}
                                value={g.talonario}
                                onChange={(e) =>
                                    onUpdate({
                                        talonario: e.target.value.replace(
                                            /\D/g,
                                            '',
                                        ),
                                    })
                                }
                                onWheel={blockScroll}
                                style={{
                                    ...inputStyle,
                                    transition: 'border-color 0.2s ease',
                                    borderBottomColor: campoBorde(g.talonario, { required: true }),
                                }}
                            />
                        </Campo>
                        <Campo label="Número de comprobante" hint="">
                            <input
                                type="text"
                                maxLength={8}
                                value={g.numero_comprobante}
                                onChange={(e) =>
                                    onUpdate({
                                        numero_comprobante:
                                            e.target.value.replace(/\D/g, ''),
                                    })
                                }
                                onWheel={blockScroll}
                                style={{
                                    ...inputStyle,
                                    transition: 'border-color 0.2s ease',
                                    borderBottomColor: campoBorde(g.numero_comprobante, { required: true }),
                                }}
                            />
                        </Campo>
                    </>
                )}
            </div>

            <Campo
                label={
                    g.sinComprobante
                        ? 'Importe total del comprobante'
                        : 'Importe neto'
                }
                hint=""
            >
                <input
                    type="number"
                    step="0.01"
                    value={g.importe_neto}
                    onChange={(e) => onUpdate({ importe_neto: e.target.value })}
                    onWheel={blockScroll}
                    style={{
                        ...inputStyle,
                        transition: 'border-color 0.2s ease',
                        borderBottomColor: campoBorde(g.importe_neto, { required: true }),
                    }}
                />
            </Campo>

            {!g.sinComprobante && (
                <>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3,1fr)',
                            gap: '16px',
                        }}
                    >
                        <Campo label="IVA 27%" hint="">
                            <input
                                type="number"
                                step="0.01"
                                value={g.iva_27}
                                onChange={(e) =>
                                    onUpdate({ iva_27: e.target.value })
                                }
                                onWheel={blockScroll}
                                style={{
                                    ...inputStyle,
                                    transition: 'border-color 0.2s ease',
                                    borderBottomColor: campoBorde(g.iva_27),
                                }}
                            />
                        </Campo>
                        <Campo label="IVA 21%" hint="">
                            <input
                                type="number"
                                step="0.01"
                                value={g.iva_21}
                                onChange={(e) =>
                                    onUpdate({ iva_21: e.target.value })
                                }
                                onWheel={blockScroll}
                                style={{
                                    ...inputStyle,
                                    transition: 'border-color 0.2s ease',
                                    borderBottomColor: campoBorde(g.iva_21),
                                }}
                            />
                        </Campo>
                        <Campo label="IVA 10,5%" hint="">
                            <input
                                type="number"
                                step="0.01"
                                value={g.iva_105}
                                onChange={(e) =>
                                    onUpdate({ iva_105: e.target.value })
                                }
                                onWheel={blockScroll}
                                style={{
                                    ...inputStyle,
                                    transition: 'border-color 0.2s ease',
                                    borderBottomColor: campoBorde(g.iva_105),
                                }}
                            />
                        </Campo>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4,1fr)',
                            gap: '16px',
                        }}
                    >
                        <Campo label="Percepción IVA" hint="">
                            <input
                                type="number"
                                step="0.01"
                                value={g.percepcion_iva}
                                onChange={(e) =>
                                    onUpdate({ percepcion_iva: e.target.value })
                                }
                                onWheel={blockScroll}
                                style={{
                                    ...inputStyle,
                                    transition: 'border-color 0.2s ease',
                                    borderBottomColor: campoBorde(g.percepcion_iva),
                                }}
                            />
                        </Campo>
                        <Campo label="Percepción IIBB CABA" hint="">
                            <input
                                type="number"
                                step="0.01"
                                value={g.percepcion_iibb_caba}
                                onChange={(e) =>
                                    onUpdate({
                                        percepcion_iibb_caba: e.target.value,
                                    })
                                }
                                onWheel={blockScroll}
                                style={{
                                    ...inputStyle,
                                    transition: 'border-color 0.2s ease',
                                    borderBottomColor: campoBorde(g.percepcion_iibb_caba),
                                }}
                            />
                        </Campo>
                        <Campo label="Percepción IIBB Santa Cruz" hint="">
                            <input
                                type="number"
                                step="0.01"
                                value={g.percepcion_iibb_sc}
                                onChange={(e) =>
                                    onUpdate({
                                        percepcion_iibb_sc: e.target.value,
                                    })
                                }
                                onWheel={blockScroll}
                                style={{
                                    ...inputStyle,
                                    transition: 'border-color 0.2s ease',
                                    borderBottomColor: campoBorde(g.percepcion_iibb_sc),
                                }}
                            />
                        </Campo>
                        <Campo label="Percepción IIBB T. de Fuego" hint="">
                            <input
                                type="number"
                                step="0.01"
                                value={g.percepcion_iibb_tdf}
                                onChange={(e) =>
                                    onUpdate({
                                        percepcion_iibb_tdf: e.target.value,
                                    })
                                }
                                onWheel={blockScroll}
                                style={{
                                    ...inputStyle,
                                    transition: 'border-color 0.2s ease',
                                    borderBottomColor: campoBorde(g.percepcion_iibb_tdf),
                                }}
                            />
                        </Campo>
                    </div>
                    <Campo
                        label="Otros cargos (que no encajen en ninguna categoría anterior)"
                        hint=""
                    >
                        <input
                            type="number"
                            step="0.01"
                            value={g.otros_cargos}
                            onChange={(e) =>
                                onUpdate({ otros_cargos: e.target.value })
                            }
                            onWheel={blockScroll}
                            style={{
                                ...inputStyle,
                                transition: 'border-color 0.2s ease',
                                borderBottomColor: campoBorde(g.otros_cargos),
                            }}
                        />
                    </Campo>
                </>
            )}
        </>
    );
}

function CamposExtranjera({
    g,
    onUpdate,
    blockScroll,
}: {
    g: Gasto;
    onUpdate: (patch: Partial<Gasto>) => void;
    blockScroll: (e: WheelEvent) => void;
}) {
    return (
        <>
            <Campo label="Concepto" hint="">
                <select
                    value={g.concepto_ext}
                    onChange={(e) => onUpdate({ concepto_ext: e.target.value })}
                    style={selectStyle}
                >
                    <option value="">Elegir...</option>
                    {TIPOS_GASTO.map((t) => (
                        <option key={t} value={t}>
                            {t.trim()}
                        </option>
                    ))}
                </select>
            </Campo>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3,1fr)',
                    gap: '16px',
                }}
            >
                <Campo label="Moneda de la transacción" hint="">
                    <select
                        value={g.moneda_iso}
                        onChange={(e) => {
                            const moneda_iso = e.target.value;
                            onUpdate(
                                moneda_iso === 'USD'
                                    ? { moneda_iso, tipo_cambio_a_dolares: '1' }
                                    : { moneda_iso },
                            );
                        }}
                        style={selectStyle}
                    >
                        {MONEDAS_ISO.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </Campo>
                <Campo label="Importe original (en esa moneda)" hint="">
                    <input
                        type="number"
                        step="0.01"
                        value={g.importe_original}
                        onChange={(e) =>
                            onUpdate({ importe_original: e.target.value })
                        }
                        onWheel={blockScroll}
                        style={{
                            ...inputStyle,
                            transition: 'border-color 0.2s ease',
                            borderBottomColor: campoBorde(g.importe_original, { required: true }),
                        }}
                    />
                </Campo>
                <Campo
                    label="Tipo de cambio a dólares"
                    hint={
                        g.moneda_iso === 'USD'
                            ? 'En USD siempre es 1.'
                            : `Cuántos dólares equivalen a 1 ${g.moneda_iso}.`
                    }
                >
                    <input
                        type="number"
                        step="0.0001"
                        disabled={g.moneda_iso === 'USD'}
                        value={g.tipo_cambio_a_dolares}
                        onChange={(e) =>
                            onUpdate({ tipo_cambio_a_dolares: e.target.value })
                        }
                        onWheel={blockScroll}
                        style={{
                            ...inputStyle,
                            transition: 'border-color 0.2s ease',
                            borderBottomColor: g.moneda_iso === 'USD'
                                ? '#000'
                                : campoBorde(g.tipo_cambio_a_dolares, { required: true }),
                        }}
                    />
                </Campo>
            </div>
        </>
    );
}

function ComprobanteInput({
    gasto: g,
    onUpdate,
}: {
    gasto: Gasto;
    onUpdate: (patch: Partial<Gasto>) => void;
}) {
    const [ocrStatus, setOcrStatus] = useState<
        'idle' | 'leyendo' | 'ok' | 'sin-lectura' | 'error'
    >('idle');
    const [ocrMensajes, setOcrMensajes] = useState<OcrMensaje[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const ejecutarOcr = useCallback(
        async (comprobante_image: NonNullable<Gasto['comprobante_image']>) => {
            setOcrStatus('leyendo');
            setOcrMensajes([]);

            const { patch, resultado } = await leerComprobante(
                comprobante_image,
                g.monedaTipo,
            );

            if (resultado === null) {
                setOcrStatus('error');

                return;
            }

            if (Object.keys(patch).length > 0) {
                onUpdate(patch);
            }

            setOcrMensajes(resultado.mensajes);
            setOcrStatus(
                resultado.estado_lectura === 'SIN_LECTURA'
                    ? 'sin-lectura'
                    : 'ok',
            );
        },
        [g.monedaTipo, onUpdate],
    );

    return (
        <Campo
            label="Adjuntar comprobante (foto o escaneo)"
            hint="Se guarda dentro del Excel, en la hoja de comprobantes, lista para Tesorería. Subilo primero: se lee automáticamente con IA."
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                    const file = e.target.files?.[0];

                    if (!file) {
                        return;
                    }

                    const comprobante_image = await procesarImagen(file);
                    onUpdate({ comprobante_image });
                    e.target.value = '';

                    await ejecutarOcr(comprobante_image);
                }}
                style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    opacity: 0,
                    overflow: 'hidden',
                }}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={ocrStatus === 'leyendo'}
                style={{
                    ...mono,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '100%',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '16px',
                    background: g.comprobante_image ? '#fff' : '#000',
                    color: g.comprobante_image ? '#000' : '#fff',
                    border: '1px solid #000',
                    cursor: ocrStatus === 'leyendo' ? 'default' : 'pointer',
                }}
            >
                <span style={{ fontSize: '15px', lineHeight: 1 }}>
                    {g.comprobante_image ? '↻' : '+'}
                </span>
                {g.comprobante_image
                    ? 'Cambiar comprobante'
                    : 'Adjuntar comprobante'}
            </button>
            {ocrStatus === 'leyendo' && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '10px',
                        padding: '10px 14px',
                        border: '1px solid #000',
                        background: '#f6f5f2',
                    }}
                >
                    <span className="ocr-spinner" aria-hidden="true" />
                    <span
                        style={{
                            ...mono,
                            fontSize: '11px',
                            color: '#000',
                            fontWeight: 700,
                        }}
                    >
                        Leyendo comprobante con IA…
                    </span>
                </div>
            )}
            {ocrStatus === 'ok' && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '10px',
                        padding: '10px 14px',
                        border: `1px solid #1e7a2e`,
                        background: '#eaf7ec',
                    }}
                >
                    <span
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '15px',
                            color: '#1e7a2e',
                            lineHeight: 1,
                        }}
                    >
                        ✓
                    </span>
                    <span
                        style={{
                            ...mono,
                            fontSize: '11px',
                            color: '#1e7a2e',
                            fontWeight: 700,
                        }}
                    >
                        Listo — datos leídos automáticamente. Revisá y corregí
                        si hace falta.
                    </span>
                </div>
            )}
            {(ocrStatus === 'sin-lectura' || ocrStatus === 'error') && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '10px',
                        padding: '10px 14px',
                        border: '1px solid #999',
                        background: '#f6f5f2',
                    }}
                >
                    <span
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '15px',
                            color: '#666',
                            lineHeight: 1,
                        }}
                    >
                        !
                    </span>
                    <span
                        style={{
                            ...mono,
                            fontSize: '11px',
                            color: '#666',
                            flex: 1,
                        }}
                    >
                        No se pudo leer el comprobante automáticamente —
                        completá los datos a mano.
                    </span>
                </div>
            )}
            {ocrMensajes.length > 0 && (
                <ul
                    style={{
                        margin: '6px 0 0',
                        paddingLeft: '18px',
                        fontSize: '11.5px',
                        color: '#886',
                    }}
                >
                    {ocrMensajes.map((m) => (
                        <li
                            key={m.codigo}
                            style={{
                                color:
                                    m.nivel === 'error'
                                        ? RED
                                        : m.nivel === 'advertencia'
                                          ? '#9a6a00'
                                          : '#666',
                            }}
                        >
                            {m.texto}
                        </li>
                    ))}
                </ul>
            )}
            {(ocrStatus === 'ok' ||
                ocrStatus === 'sin-lectura' ||
                ocrStatus === 'error') && (
                <button
                    type="button"
                    onClick={() =>
                        g.comprobante_image &&
                        void ejecutarOcr(g.comprobante_image)
                    }
                    style={{
                        ...mono,
                        marginTop: '8px',
                        fontSize: '10px',
                        background: '#fff',
                        border: '1px solid #000',
                        padding: '5px 10px',
                        cursor: 'pointer',
                    }}
                >
                    ↻ Reintentar lectura
                </button>
            )}
            {g.comprobante_image && (
                <div
                    style={{
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <img
                        src={g.comprobante_image.dataUrl}
                        style={{
                            maxWidth: '120px',
                            maxHeight: '120px',
                            border: '1px solid #000',
                        }}
                        alt="Comprobante adjunto"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            onUpdate({ comprobante_image: null });
                            setOcrStatus('idle');
                            setOcrMensajes([]);
                        }}
                        style={botonStyle}
                    >
                        Quitar
                    </button>
                </div>
            )}
        </Campo>
    );
}

function Resumen({
    header,
    gastos,
    totalArs,
    totalUsd,
}: {
    header: Header;
    gastos: Gasto[];
    totalArs: number;
    totalUsd: number;
}) {
    const conImagen = gastos.filter((g) => g.comprobante_image).length;

    return (
        <>
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '13px',
                    marginBottom: '20px',
                }}
            >
                <tbody>
                    {[
                        ['Empresa', header.empresa],
                        ['Nombre', header.nombre_apellido],
                        ['Iniciales', header.iniciales],
                        ['Fecha', header.fecha_gasto],
                        ['Concepto', header.concepto_rendicion],
                        [
                            'Número de rendición',
                            String(header.numero_rendicion),
                        ],
                        ...(totalUsd > 0
                            ? [
                                  [
                                      'Tipo de cambio general',
                                      String(header.tipo_cambio_general),
                                  ],
                              ]
                            : []),
                    ].map(([k, v]) => (
                        <tr key={k}>
                            <th
                                style={{
                                    textAlign: 'left',
                                    color: '#666',
                                    borderBottom: '1px solid #ddd',
                                    padding: '8px 6px',
                                    fontWeight: 600,
                                }}
                            >
                                {k}
                            </th>
                            <td
                                style={{
                                    borderBottom: '1px solid #ddd',
                                    padding: '8px 6px',
                                }}
                            >
                                {v}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
                        {[
                            '#',
                            'Moneda',
                            'Proveedor / Razón social',
                            'File',
                            'Importe',
                            'Forma de pago',
                            'Comprobante',
                        ].map((h) => (
                            <th
                                key={h}
                                style={{
                                    textAlign: 'left',
                                    color: '#666',
                                    borderBottom: '1px solid #000',
                                    padding: '0 6px 7px',
                                    fontWeight: 600,
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {gastos.map((g, i) => (
                        <tr key={g.id}>
                            <td
                                style={{
                                    borderBottom: '1px solid #ddd',
                                    padding: '8px 6px',
                                }}
                            >
                                {i + 1}
                            </td>
                            <td
                                style={{
                                    borderBottom: '1px solid #ddd',
                                    padding: '8px 6px',
                                }}
                            >
                                {gastoMoneda(g)}
                            </td>
                            <td
                                style={{
                                    borderBottom: '1px solid #ddd',
                                    padding: '8px 6px',
                                }}
                            >
                                {g.proveedor}
                            </td>
                            <td
                                style={{
                                    borderBottom: '1px solid #ddd',
                                    padding: '8px 6px',
                                }}
                            >
                                {g.esFile ? g.file_numero : 'General'}
                            </td>
                            <td
                                style={{
                                    borderBottom: '1px solid #ddd',
                                    padding: '8px 6px',
                                }}
                            >
                                {fmtByMoneda(gastoTotal(g), gastoMoneda(g))}
                            </td>
                            <td
                                style={{
                                    borderBottom: '1px solid #ddd',
                                    padding: '8px 6px',
                                }}
                            >
                                {g.forma_pago}
                            </td>
                            <td
                                style={{
                                    borderBottom: '1px solid #ddd',
                                    padding: '8px 6px',
                                }}
                            >
                                {g.comprobante_image ? '✓ adjunto' : '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p
                style={{
                    textAlign: 'right',
                    fontWeight: 700,
                    marginTop: '10px',
                }}
            >
                Total en pesos: {fmtMoney(totalArs)}
                {totalUsd > 0 && (
                    <>
                        <br />
                        Total en moneda extranjera:{' '}
                        {fmtByMoneda(totalUsd, 'USD')}
                    </>
                )}
            </p>

            {conImagen > 0 && (
                <p style={{ ...mono, textTransform: 'none', color: '#666' }}>
                    {conImagen} comprobante(s) con foto adjunta — se van a
                    insertar en la hoja de comprobantes del Excel.
                </p>
            )}
        </>
    );
}

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
                El panel corre en esta misma computadora: no sube tus datos ni
                comprobantes a ningún servidor.
            </div>
            <div style={{ ...mono, color: '#666', whiteSpace: 'nowrap' }}>
                mantiene— Homez, Valentina · act. 07·2026
            </div>
        </div>
    );
}

AdmRendicionGastos.layout = { active: 'adm', label: 'Rendición de gastos—' };
