/**
 * Motor del Panel de Rendición de Gastos — reglas de negocio y validaciones.
 *
 * Porte 1:1 de las constantes y funciones puras del panel HTML autónomo
 * (docs/Cuentas-A-Pagar/Panel_Rendicion_Gastos.html) armado por Valentina
 * Homez, sin cambios de comportamiento. Estructuras puras, sin DOM, para que
 * la página React sólo se ocupe de pintar estado.
 */

export type RendicionTipo = 'ARS' | 'EXTRANJERA';

export type Empresa = 'Euro_Arg' | 'Travel_Designers' | 'Euro_USA' | 'LAT';

export const MAX_GASTOS = 60;

export const TIPOS_GASTO = [
    'ABONOS VARIOS Y SUSCRIP.',
    'COMBUSTIBLE',
    'IMPUESTO AUTOMOTORES',
    'UTILES DE OFICINA',
    'GASTOS FRANQUEO Y ENVIO',
    'GTOS DE MANT. GENERAL',
    'MANTENIMIENTO RODADOS',
    'OTROS EGRESOS DE ADM.',
    'LIMPIEZA',
    'OTROS IMPUESTOS',
    'GASTOS PROMOCIONALES',
    'MEMBRESIAS ',
    'IMPUESTOS Y TASAS  VARIOS',
    'TELEFONIA CELULAR',
    'LUZ, GAS Y AGUA',
    'EXPENSAS',
    'MOVILIDAD Y VIATICOS',
    'REP Y MANT DE EQUIPOS',
    'GASTOS DE REPRESENTACION',
    'CAFETERIA Y REFRIGERIOS',
    'PROPINAS',
    'sin codificar',
] as const;

export type FormaPago = { label: string; value: string; cuenta: string };

export const FORMAS_PAGO: FormaPago[] = [
    { label: 'Efectivo (pesos)', value: 'efectivo PESOS', cuenta: '113601' },
    { label: 'Efectivo (USD)', value: 'efectivo USD', cuenta: '113651' },
    { label: 'Fondo Fijo TD', value: 'Fondo Fijo TD', cuenta: '111108' },
    {
        label: 'Amex corporativa (pesos)',
        value: 'amex corp PESOS',
        cuenta: '113603',
    },
    {
        label: 'Amex corporativa (USD)',
        value: 'amex corp USD',
        cuenta: '113151',
    },
    {
        label: 'Visa corporativa (pesos)',
        value: 'visa corp PESOS',
        cuenta: '113602',
    },
    {
        label: 'Visa corporativa (USD)',
        value: 'visa corp USD',
        cuenta: '113156',
    },
    { label: 'Reciclaje', value: 'reciclaje', cuenta: '111108' },
];

export type LetraFactura = { label: string; value: string };

export const LETRAS_FACTURA: LetraFactura[] = [
    { label: 'Factura A', value: 'A' },
    { label: 'Factura B', value: 'B' },
    { label: 'Factura C', value: 'C' },
    { label: 'Factura M (Monotributo)', value: 'M' },
    { label: 'Sin comprobante / CUIT inválido', value: 'SC' },
];

export const COMPANY_CODES: Record<Empresa, string> = {
    Euro_Arg: 'EA',
    Travel_Designers: 'TD',
    Euro_USA: 'EU',
    LAT: 'LT',
};

export const MONEDAS_ISO = [
    'USD',
    'EUR',
    'GBP',
    'CHF',
    'JPY',
    'CNY',
    'CLP',
    'BRL',
    'UYU',
] as const;

export const MAX_IMAGE_DIM = 1400;
export const JPEG_QUALITY = 0.82;

export type ComprobanteImagen = {
    dataUrl: string;
    mime: 'image/jpeg';
    cx: number;
    cy: number;
};

export type Gasto = {
    id: number;
    monedaTipo: RendicionTipo;
    esFile: boolean;
    file_numero: string;
    fecha: string;
    proveedor: string;
    forma_pago: string;
    comprobante_image: ComprobanteImagen | null;
    // campos exclusivos de gastos en ARS
    tipo_gasto: string;
    cuit: string;
    sinComprobante: boolean;
    letra_factura: string;
    talonario: string;
    numero_comprobante: string;
    importe_neto: string;
    iva_27: string;
    iva_21: string;
    iva_105: string;
    percepcion_iva: string;
    percepcion_iibb_caba: string;
    percepcion_iibb_sc: string;
    percepcion_iibb_tdf: string;
    otros_cargos: string;
    // campos exclusivos de gastos en moneda extranjera
    concepto_ext: string;
    moneda_iso: string;
    importe_original: string;
    tipo_cambio_a_dolares: string;
};

export function nuevoGasto(id: number, rendicionTipo: RendicionTipo): Gasto {
    return {
        id,
        monedaTipo: rendicionTipo,
        esFile: false,
        file_numero: '',
        fecha: '',
        proveedor: '',
        forma_pago: '',
        comprobante_image: null,
        tipo_gasto: '',
        cuit: '',
        sinComprobante: false,
        letra_factura: '',
        talonario: '',
        numero_comprobante: '',
        importe_neto: '',
        iva_27: '',
        iva_21: '',
        iva_105: '',
        percepcion_iva: '',
        percepcion_iibb_caba: '',
        percepcion_iibb_sc: '',
        percepcion_iibb_tdf: '',
        otros_cargos: '',
        concepto_ext: '',
        moneda_iso: 'USD',
        importe_original: '',
        tipo_cambio_a_dolares: '1',
    };
}

export type Header = {
    empresa: Empresa;
    nombre_apellido: string;
    iniciales: string;
    fecha_gasto: string;
    concepto_rendicion: string;
    numero_rendicion: number;
    tipo_cambio_general: number;
};

/** Dígito verificador de CUIT (misma validación que la planilla oficial). */
export function cuitCheck(cuitStr: string): boolean {
    if (!cuitStr || !/^\d{11}$/.test(cuitStr)) {
        return false;
    }

    const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let total = 0;

    for (let i = 0; i < 10; i++) {
        total += parseInt(cuitStr[i], 10) * pesos[i];
    }

    const resto = total % 11;
    const digitoCalc = resto === 0 ? 0 : 11 - resto;

    if (digitoCalc === 10) {
        return false;
    }

    return digitoCalc === parseInt(cuitStr[10], 10);
}

export function fileNumeroValido(s: string): boolean {
    return /^[A-Z]{4}\d{6}$/.test(s);
}

export function fmtMoney(n: number): string {
    return (
        '$' +
        (Number(n) || 0).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    );
}

export function gastoTotal(g: Gasto): number {
    if (g.monedaTipo === 'EXTRANJERA') {
        return (
            (parseFloat(g.importe_original) || 0) *
            (parseFloat(g.tipo_cambio_a_dolares) || 0)
        );
    }

    const fields: (keyof Gasto)[] = [
        'importe_neto',
        'iva_27',
        'iva_21',
        'iva_105',
        'percepcion_iva',
        'percepcion_iibb_caba',
        'percepcion_iibb_sc',
        'percepcion_iibb_tdf',
        'otros_cargos',
    ];

    return fields.reduce((s, f) => s + (parseFloat(g[f] as string) || 0), 0);
}

export function gastoMoneda(g: Gasto): 'ARS' | 'USD' {
    return g.monedaTipo === 'EXTRANJERA' ? 'USD' : 'ARS';
}

export function fmtByMoneda(n: number, moneda: 'ARS' | 'USD'): string {
    return moneda === 'USD'
        ? 'US$ ' +
              (Number(n) || 0).toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : fmtMoney(n);
}

export function validarPaso1(
    header: Header,
    rendicionTipo: RendicionTipo,
): string[] {
    const errs: string[] = [];

    if (!header.nombre_apellido) {
        errs.push('Falta el nombre y apellido.');
    }

    if (!(header.iniciales.length === 2 || header.iniciales.length === 3)) {
        errs.push('Las iniciales deben tener 2 o 3 letras.');
    }

    if (!header.fecha_gasto) {
        errs.push('Falta la fecha del viaje/gasto.');
    }

    if (!header.concepto_rendicion) {
        errs.push('Falta el concepto general de la rendición.');
    }

    if (rendicionTipo === 'EXTRANJERA' && !header.tipo_cambio_general) {
        errs.push(
            'Elegiste rendición en moneda extranjera: falta el tipo de cambio general (dólar a pesos).',
        );
    }

    return errs;
}

export function validarPaso2(gastos: Gasto[]): string[] {
    const errs: string[] = [];

    if (gastos.length === 0) {
        errs.push('Todavía no cargaste ningún gasto.');
    }

    gastos.forEach((g, idx) => {
        const n = idx + 1;

        if (!g.proveedor) {
            errs.push(`Gasto ${n}: falta el proveedor.`);
        }

        if (!g.fecha) {
            errs.push(`Gasto ${n}: falta la fecha.`);
        }

        if (!g.forma_pago) {
            errs.push(`Gasto ${n}: falta la forma de pago.`);
        }

        if (g.esFile && !fileNumeroValido(g.file_numero)) {
            errs.push(
                `Gasto ${n}: el número de file no tiene el formato correcto (4 letras + 6 números).`,
            );
        }

        if (g.monedaTipo === 'EXTRANJERA') {
            if (!g.concepto_ext) {
                errs.push(`Gasto ${n}: falta elegir el concepto.`);
            }

            if (!g.importe_original || parseFloat(g.importe_original) <= 0) {
                errs.push(`Gasto ${n}: falta el importe original.`);
            }

            if (
                !g.tipo_cambio_a_dolares ||
                parseFloat(g.tipo_cambio_a_dolares) <= 0
            ) {
                errs.push(`Gasto ${n}: falta el tipo de cambio a dólares.`);
            }
        } else {
            if (!g.importe_neto || parseFloat(g.importe_neto) <= 0) {
                errs.push(`Gasto ${n}: falta el importe.`);
            }

            if (!g.esFile && !g.tipo_gasto) {
                errs.push(`Gasto ${n}: falta elegir el tipo de gasto.`);
            }

            if (!g.sinComprobante) {
                if (!g.cuit) {
                    errs.push(
                        `Gasto ${n}: falta el CUIT (o tildá "no tengo comprobante válido").`,
                    );
                } else if (!cuitCheck(g.cuit)) {
                    errs.push(`Gasto ${n}: el CUIT ingresado no es válido.`);
                }

                if (!g.letra_factura) {
                    errs.push(`Gasto ${n}: falta el tipo de factura.`);
                }
            }
        }
    });

    return errs;
}

export function nombreArchivo(header: Header): string {
    const code = COMPANY_CODES[header.empresa] || 'EA';
    const [y, m, d] = header.fecha_gasto.split('-');

    return `${code}${header.iniciales}${y}${m}${d}.xlsx`;
}
