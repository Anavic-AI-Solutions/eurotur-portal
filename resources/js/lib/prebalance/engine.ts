/**
 * Motor de armado del Pre-Balance de Módulos — Tango Gestión.
 *
 * Replica el proceso manual descripto por Elsa Quintana sobre el archivo
 * "Modelo de Pre-balance de módulos": normaliza el código de cuenta, calcula el
 * importe neto (debe − haber), agrupa por cuenta y cruza los tres módulos
 * contra el Sumas y Saldos.
 *
 * Recibe workbooks ya abiertos por ExcelJS y devuelve estructuras puras, así
 * que se puede testear sin navegador.
 */
import type { CellValue, Workbook, Worksheet } from 'exceljs';

/** Tolerancia de redondeo para el control de cero. */
export const TOL = 0.005;

/** Los tres módulos que se cruzan contra el Sumas y Saldos, en orden de salida. */
export const ORDEN = ['Tesoreria', 'Compras', 'Ventas'] as const;

export type ModuloTipo = (typeof ORDEN)[number];
export type ReporteTipo = ModuloTipo | 'SyS';

export type Nivel = 'OK' | 'ALERTA' | 'ERROR' | 'INFO';

export type Validacion = {
    nivel: Nivel;
    control: string;
    detalle: string;
};

export type Periodo = { desde: string; hasta: string };

type HeaderMap = Record<string, number>;

export type ReporteInfo = {
    tipo: ReporteTipo | null;
    ws?: Worksheet;
    empresa: string;
    cuit: string;
    hdr?: HeaderMap;
};

export type FilaModulo = {
    cuenta: string;
    vals: CellValue[];
    neto: number;
};

export type Modulo = {
    tipo: ModuloTipo;
    empresa: string;
    cuit: string;
    archivo?: string;
    headers: string[];
    ncols: number;
    colDebe: number;
    colHaber: number;
    filas: FilaModulo[];
    resumen: { cuenta: string; importe: number }[];
    grupos: Record<string, number>;
    descPorCuenta: Record<string, string>;
    totalNeto: number;
    balancea: boolean;
    exportados: number;
    sinCodigo: { fila: number; valor: string }[];
    fechaMin: Date | null;
    fechaMax: Date | null;
};

export type CuentaSyS = {
    extrae: string;
    codigo: string;
    desc: string;
    saldoIni: number;
    debitos: number;
    creditos: number;
    saldo: number;
};

export type SumasYSaldos = {
    tipo: 'SyS';
    empresa: string;
    cuit: string;
    archivo?: string;
    cuentas: CuentaSyS[];
    set: Record<string, boolean>;
    duplicadas: string[];
    totalSaldo: number;
};

export type FilaConciliacion = CuentaSyS &
    Record<ModuloTipo, number> & { saldoContable: number };

export type Totales = Record<
    | 'saldoIni'
    | 'debitos'
    | 'creditos'
    | 'saldo'
    | ModuloTipo
    | 'saldoContable',
    number
>;

export type Consolidado = {
    filas: FilaConciliacion[];
    totales: Totales;
    huerfanas: {
        modulo: ModuloTipo;
        cuenta: string;
        desc: string;
        importe: number;
    }[];
};

export type Resultado = {
    sys: SumasYSaldos;
    mods: Partial<Record<ModuloTipo, Modulo>>;
    cons: Consolidado;
    validaciones: Validacion[];
    avisos: string[];
    empresa: string;
    cuit: string;
    hayError: boolean;
};

/* ------------------------------------------------------------------ utils */

export function cellText(v: CellValue | undefined): string {
    if (v === null || v === undefined) {
        return '';
    }

    if (v instanceof Date) {
        return v.toISOString().slice(0, 10);
    }

    if (typeof v === 'object') {
        const o = v as {
            richText?: { text: string }[];
            text?: unknown;
            result?: unknown;
        };

        if (o.richText) {
            return o.richText.map((r) => r.text).join('');
        }

        if (o.text !== undefined) {
            return String(o.text);
        }

        if (o.result !== undefined) {
            return String(o.result);
        }

        return '';
    }

    return String(v);
}

/** Tango puede exportar los importes como número o como texto es-AR. */
export function num(v: CellValue | undefined): number {
    if (v === null || v === undefined || v === '') {
        return 0;
    }

    if (typeof v === 'number') {
        return v;
    }

    if (
        typeof v === 'object' &&
        typeof (v as { result?: unknown }).result === 'number'
    ) {
        return (v as { result: number }).result;
    }

    let s = cellText(v).trim();

    if (s === '') {
        return 0;
    }

    s = s.replace(/\s/g, '');

    // formato es-AR: 1.234.567,89 -> 1234567.89
    if (/,\d{1,2}$/.test(s) && s.indexOf('.') > -1) {
        s = s.replace(/\./g, '').replace(',', '.');
    } else if (/,/.test(s) && !/\./.test(s)) {
        s = s.replace(',', '.');
    }

    const n = parseFloat(s);

    return isNaN(n) ? 0 : n;
}

export function toDate(v: CellValue | undefined): Date | null {
    if (v instanceof Date) {
        return v;
    }

    if (typeof v === 'number') {
        return new Date(Date.UTC(1899, 11, 30) + v * 86400000);
    }

    const s = cellText(v).trim();

    if (!s) {
        return null;
    }

    const d = new Date(s);

    return isNaN(d.getTime()) ? null : d;
}

/**
 * Equivalente a la fórmula =MID(B2,1,6) de la columna "Extrae", pero tolerante
 * a espacios de más y a códigos de distinto largo.
 */
export function extraeCuenta(v: CellValue | undefined): string {
    const s = cellText(v).trim();
    const m = s.match(/^(\d{4,10})/);

    if (m) {
        return m[1].slice(0, 6);
    }

    return s.split('-')[0].trim().slice(0, 6);
}

export function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

function norm(s: CellValue | undefined): string {
    return cellText(s)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
}

export function fmtFecha(d: Date | null): string {
    if (!d) {
        return '';
    }

    const p = d.toISOString().slice(0, 10).split('-');

    return `${p[2]}-${p[1]}-${p[0]}`;
}

/* -------------------------------------------------- lectura de una hoja */

function headerMap(ws: Worksheet): HeaderMap {
    const map: HeaderMap = {};
    ws.getRow(1).eachCell({ includeEmpty: false }, (cell, col) => {
        const h = norm(cell.value);

        if (h && map[h] === undefined) {
            map[h] = col;
        }
    });

    return map;
}

function lastDataRow(ws: Worksheet, keyCol: number): number {
    let last = 1;

    for (let r = 2; r <= ws.rowCount; r++) {
        if (cellText(ws.getRow(r).getCell(keyCol).value).trim() !== '') {
            last = r;
        }
    }

    return last;
}

/**
 * Deduce del contenido cuál de los 4 reportes de Tango es cada archivo, para
 * que Contabilidad no tenga que indicarlo:
 *   SyS         -> hoja "Balance de saldos de asiento…"
 *   LXC Ventas  -> Listado por Imputación Contable + columna "Cliente"
 *   LXC Compras -> Listado por Imputación Contable + columna "Proveedor"
 *   LXC Tesor.  -> Listado por Imputación Contable + "Barra"/"Concepto"
 */
export function identificar(wb: Workbook): ReporteInfo {
    let empresa = '';
    let cuit = '';
    const de = wb.worksheets.filter(
        (w) => norm(w.name) === 'datos de la empresa',
    )[0];

    if (de) {
        empresa = cellText(de.getRow(2).getCell(1).value).trim();
        cuit = cellText(de.getRow(2).getCell(7).value).trim();
    }

    const sys = wb.worksheets.filter((w) =>
        /balance de saldos/.test(norm(w.name)),
    )[0];

    if (sys) {
        return { tipo: 'SyS', ws: sys, empresa, cuit };
    }

    const lxc = wb.worksheets.filter((w) =>
        /imputacion contab/.test(norm(w.name)),
    )[0];

    if (lxc) {
        const h = headerMap(lxc);
        const tipo: ModuloTipo | null = h['proveedor']
            ? 'Compras'
            : h['cliente']
              ? 'Ventas'
              : h['concepto'] || h['barra']
                ? 'Tesoreria'
                : null;

        if (tipo) {
            return { tipo, ws: lxc, empresa, cuit, hdr: h };
        }
    }

    // fallback: buscar los encabezados típicos en cualquier hoja
    for (const w of wb.worksheets) {
        const hh = headerMap(w);

        if (hh['codigo de cuenta'] && hh['saldo inicial']) {
            return { tipo: 'SyS', ws: w, empresa, cuit };
        }

        if (hh['cuenta'] && hh['debe'] && hh['haber']) {
            const t: ModuloTipo = hh['proveedor']
                ? 'Compras'
                : hh['cliente']
                  ? 'Ventas'
                  : 'Tesoreria';

            return { tipo: t, ws: w, empresa, cuit, hdr: hh };
        }
    }

    return { tipo: null, empresa, cuit };
}

/**
 * Procesa un Listado por Imputación Contable: normaliza la cuenta, calcula el
 * importe neto (debe − haber), agrupa y verifica el control de cero.
 */
export function procesarModulo(info: ReporteInfo): Modulo {
    const ws = info.ws;

    if (!ws || info.tipo === null || info.tipo === 'SyS') {
        throw new Error('El reporte no es un Listado por Imputación Contable.');
    }

    const h = info.hdr ?? headerMap(ws);
    const cCuenta = h['cuenta'];
    const cDebe = h['debe'];
    const cHaber = h['haber'];
    const cExp = h['exportado'];
    const cFecha = h['fecha'];

    if (!cCuenta || !cDebe || !cHaber) {
        throw new Error(
            `El reporte de ${info.tipo} no tiene las columnas Cuenta / Debe / Haber.`,
        );
    }

    let ncols = 0;
    ws.getRow(1).eachCell({ includeEmpty: false }, (_c, col) => {
        if (col > ncols) {
            ncols = col;
        }
    });

    const last = lastDataRow(ws, cCuenta);
    const headers: string[] = [];

    for (let c = 1; c <= ncols; c++) {
        headers.push(cellText(ws.getRow(1).getCell(c).value).trim());
    }

    const filas: FilaModulo[] = [];
    const grupos: Record<string, number> = {};
    const descPorCuenta: Record<string, string> = {};
    const sinCodigo: { fila: number; valor: string }[] = [];
    let totalNeto = 0;
    let exportados = 0;
    let fMin: Date | null = null;
    let fMax: Date | null = null;

    for (let r = 2; r <= last; r++) {
        const row = ws.getRow(r);
        const raw = cellText(row.getCell(cCuenta).value);

        if (raw.trim() === '') {
            continue;
        }

        const cta = extraeCuenta(raw);

        if (!/^\d{4,6}$/.test(cta)) {
            sinCodigo.push({ fila: r, valor: raw });
        }

        const debe = num(row.getCell(cDebe).value);
        const haber = num(row.getCell(cHaber).value);
        const neto = debe - haber;

        const vals: CellValue[] = [];

        for (let k = 1; k <= ncols; k++) {
            const v = row.getCell(k).value;

            if (k === cDebe) {
                vals.push(debe);
            } else if (k === cHaber) {
                vals.push(haber);
            } else if (cFecha && k === cFecha) {
                vals.push(toDate(v));
            } else if (
                typeof v === 'object' &&
                v !== null &&
                !(v instanceof Date)
            ) {
                vals.push(cellText(v));
            } else {
                vals.push(v);
            }
        }

        filas.push({ cuenta: cta, vals, neto });
        grupos[cta] = (grupos[cta] || 0) + neto;

        if (descPorCuenta[cta] === undefined) {
            const p = raw.split(' - ');
            descPorCuenta[cta] =
                p.length > 1 ? p.slice(1).join(' - ').trim() : '';
        }

        totalNeto += neto;

        if (cExp && /^s/i.test(cellText(row.getCell(cExp).value).trim())) {
            exportados++;
        }

        if (cFecha) {
            const d = toDate(row.getCell(cFecha).value);

            if (d) {
                if (!fMin || d < fMin) {
                    fMin = d;
                }

                if (!fMax || d > fMax) {
                    fMax = d;
                }
            }
        }
    }

    const resumen = Object.keys(grupos)
        .sort()
        .map((k) => ({ cuenta: k, importe: grupos[k] }));

    return {
        tipo: info.tipo,
        empresa: info.empresa,
        cuit: info.cuit,
        headers,
        ncols,
        colDebe: cDebe,
        colHaber: cHaber,
        filas,
        resumen,
        grupos,
        descPorCuenta,
        totalNeto,
        balancea: Math.abs(round2(totalNeto)) <= TOL,
        exportados,
        sinCodigo,
        fechaMin: fMin,
        fechaMax: fMax,
    };
}

export function procesarSyS(info: ReporteInfo): SumasYSaldos {
    const ws = info.ws;

    if (!ws) {
        throw new Error('El Sumas y Saldos no tiene hoja de datos.');
    }

    const h = headerMap(ws);
    const cCod = h['codigo de cuenta'];
    const cDesc = h['descripcion de cuenta'];
    const cIni = h['saldo inicial'];
    const cDeb = h['debitos'];
    const cCre = h['creditos'];
    const cSal = h['saldo'];

    if (!cCod || !cSal) {
        throw new Error('El Sumas y Saldos no tiene las columnas esperadas.');
    }

    const last = lastDataRow(ws, cCod);
    const cuentas: CuentaSyS[] = [];
    const vistas: Record<string, boolean> = {};
    const duplicadas: string[] = [];
    let totalSaldo = 0;

    for (let r = 2; r <= last; r++) {
        const row = ws.getRow(r);
        const codRaw = cellText(row.getCell(cCod).value);

        if (codRaw.trim() === '') {
            continue;
        }

        const cta = extraeCuenta(codRaw);

        if (vistas[cta]) {
            duplicadas.push(cta);
        } else {
            vistas[cta] = true;
        }

        const o: CuentaSyS = {
            extrae: cta,
            codigo: codRaw.trim(),
            desc: cDesc ? cellText(row.getCell(cDesc).value).trim() : '',
            saldoIni: cIni ? num(row.getCell(cIni).value) : 0,
            debitos: cDeb ? num(row.getCell(cDeb).value) : 0,
            creditos: cCre ? num(row.getCell(cCre).value) : 0,
            saldo: num(row.getCell(cSal).value),
        };
        totalSaldo += o.saldo;
        cuentas.push(o);
    }

    return {
        tipo: 'SyS',
        empresa: info.empresa,
        cuit: info.cuit,
        cuentas,
        set: vistas,
        duplicadas,
        totalSaldo,
    };
}

/** Saldo Contable = Saldo (SyS) + Tesorería + Compras + Ventas. */
export function consolidar(
    sys: SumasYSaldos,
    mods: Partial<Record<ModuloTipo, Modulo>>,
): Consolidado {
    const filas: FilaConciliacion[] = sys.cuentas.map((c) => {
        let ajuste = 0;
        const aportes = {} as Record<ModuloTipo, number>;
        ORDEN.forEach((t) => {
            const v = mods[t]?.grupos[c.extrae] ?? 0;
            aportes[t] = v;
            ajuste += v;
        });

        return { ...c, ...aportes, saldoContable: c.saldo + ajuste };
    });

    // Cuentas presentes en un módulo pero ausentes del Sumas y Saldos: en el
    // proceso manual se perderían en silencio.
    const huerfanas: Consolidado['huerfanas'] = [];
    ORDEN.forEach((t) => {
        const m = mods[t];

        if (!m) {
            return;
        }

        m.resumen.forEach((g) => {
            if (!sys.set[g.cuenta]) {
                huerfanas.push({
                    modulo: t,
                    cuenta: g.cuenta,
                    desc: m.descPorCuenta[g.cuenta] || '',
                    importe: g.importe,
                });
            }
        });
    });

    const totales: Totales = {
        saldoIni: 0,
        debitos: 0,
        creditos: 0,
        saldo: 0,
        Tesoreria: 0,
        Compras: 0,
        Ventas: 0,
        saldoContable: 0,
    };
    filas.forEach((f) => {
        (Object.keys(totales) as (keyof Totales)[]).forEach((k) => {
            totales[k] += f[k];
        });
    });

    return { filas, totales, huerfanas };
}

export function validar(
    sys: SumasYSaldos,
    mods: Partial<Record<ModuloTipo, Modulo>>,
    cons: Consolidado,
    periodo?: Periodo,
): Validacion[] {
    const v: Validacion[] = [];
    const add = (nivel: Nivel, control: string, detalle: string) =>
        v.push({ nivel, control, detalle });

    // 1. Control de cero por módulo (el control central del proceso)
    ORDEN.forEach((t) => {
        const m = mods[t];

        if (!m) {
            add(
                'ERROR',
                `Control de cero - ${t}`,
                `Falta el reporte del módulo ${t}.`,
            );

            return;
        }

        add(
            m.balancea ? 'OK' : 'ERROR',
            `Control de cero - ${t}`,
            m.balancea
                ? `Balancea en cero (${m.filas.length} filas, ${m.resumen.length} cuentas).`
                : `NO balancea. Desvío de ${round2(m.totalNeto)}. Revisar el reporte exportado de Tango.`,
        );
    });

    // 2. Misma empresa en los 4 archivos
    const emps: Record<string, boolean> = {};
    [sys.empresa, ...ORDEN.map((t) => mods[t]?.empresa)].forEach((e) => {
        if (e) {
            emps[e] = true;
        }
    });
    const lista = Object.keys(emps);
    add(
        lista.length <= 1 ? 'OK' : 'ERROR',
        'Consistencia de empresa',
        lista.length <= 1
            ? `Los 4 reportes corresponden a: ${lista[0] || 'empresa no informada por Tango'}`
            : `Los reportes son de empresas distintas: ${lista.join(' / ')}. No se pueden cruzar.`,
    );

    // 3. Comprobantes ya exportados a Contabilidad (duplicaría información)
    ORDEN.forEach((t) => {
        const m = mods[t];

        if (!m) {
            return;
        }

        add(
            m.exportados === 0 ? 'OK' : 'ALERTA',
            `Solo "Sin exportar" - ${t}`,
            m.exportados === 0
                ? 'Ningún comprobante marcado como exportado.'
                : `${m.exportados} comprobante(s) con Exportado = Sí. El reporte de Tango debe generarse con "Comprobantes con asiento = Sin exportar" para no duplicar información.`,
        );
    });

    // 4. Cuentas de módulos que no existen en el SyS
    add(
        cons.huerfanas.length === 0 ? 'OK' : 'ERROR',
        'Cuentas sin match en Sumas y Saldos',
        cons.huerfanas.length === 0
            ? 'Todas las cuentas de los módulos existen en el catálogo del Sumas y Saldos.'
            : `${cons.huerfanas.length} cuenta(s) de módulos no están en el Sumas y Saldos: ` +
                  cons.huerfanas
                      .map((h) => `${h.modulo} ${h.cuenta}`)
                      .join(', ') +
                  '. Regenerar el Balance de Tango incluyendo cuentas sin movimiento y con saldo cero.',
    );

    // 5. Cuentas duplicadas en el SyS
    add(
        sys.duplicadas.length === 0 ? 'OK' : 'ALERTA',
        'Cuentas duplicadas en Sumas y Saldos',
        sys.duplicadas.length === 0
            ? `Sin duplicados (${sys.cuentas.length} cuentas).`
            : `Códigos repetidos: ${sys.duplicadas.join(', ')}. El cruce toma el primero.`,
    );

    // 6. Códigos de cuenta ilegibles
    const mal: string[] = [];
    ORDEN.forEach((t) => {
        const m = mods[t];

        if (m && m.sinCodigo.length) {
            mal.push(`${t}: ${m.sinCodigo.length} fila(s)`);
        }
    });
    add(
        mal.length === 0 ? 'OK' : 'ALERTA',
        'Formato del código de cuenta',
        mal.length === 0
            ? 'Todos los códigos se normalizaron correctamente.'
            : mal.join(' | '),
    );

    // 7. Período detectado en los movimientos
    ORDEN.forEach((t) => {
        const m = mods[t];

        if (!m || !m.fechaMin) {
            return;
        }

        let det = `Movimientos del ${fmtFecha(m.fechaMin)} al ${fmtFecha(m.fechaMax)}.`;
        let nivel: Nivel = 'OK';

        if (periodo && periodo.desde && periodo.hasta) {
            const d1 = new Date(`${periodo.desde}T00:00:00Z`);
            const d2 = new Date(`${periodo.hasta}T23:59:59Z`);

            if (m.fechaMin < d1 || (m.fechaMax && m.fechaMax > d2)) {
                nivel = 'ALERTA';
                det += ' Queda fuera del período declarado.';
            }
        }

        add(nivel, `Período - ${t}`, det);
    });

    // 8. Saldo Contable final
    const tc = round2(cons.totales.saldoContable);
    add(
        Math.abs(tc) <= 1 ? 'OK' : 'ALERTA',
        'Saldo Contable final',
        `Total = ${tc}` +
            (Math.abs(tc) <= 1
                ? ' (dentro de la tolerancia de redondeo del propio Sumas y Saldos).'
                : '. Revisar el Sumas y Saldos de Tango: el desvío no proviene de los módulos.'),
    );

    add(
        'INFO',
        'Sumas y Saldos',
        `${sys.cuentas.length} cuentas. Total columna Saldo = ${round2(sys.totalSaldo)}.`,
    );

    return v;
}

export function procesar(
    workbooks: { nombre: string; wb: Workbook }[],
    periodo?: Periodo,
): Resultado {
    let sys: SumasYSaldos | null = null;
    const mods: Partial<Record<ModuloTipo, Modulo>> = {};
    const avisos: string[] = [];

    workbooks.forEach((item) => {
        const info = identificar(item.wb);

        if (info.tipo === 'SyS') {
            if (sys) {
                avisos.push(
                    `Se cargó más de un Sumas y Saldos; se usa "${item.nombre}".`,
                );
            }

            sys = procesarSyS(info);
            sys.archivo = item.nombre;
        } else if (info.tipo) {
            if (mods[info.tipo]) {
                avisos.push(
                    `Se cargó más de un reporte de ${info.tipo}; se usa "${item.nombre}".`,
                );
            }

            const m = procesarModulo(info);
            m.archivo = item.nombre;
            mods[info.tipo] = m;
        } else {
            avisos.push(
                `No se pudo identificar el archivo "${item.nombre}"; fue ignorado.`,
            );
        }
    });

    if (!sys) {
        throw new Error(
            'Falta el reporte de Sumas y Saldos (Balance del módulo Contabilidad).',
        );
    }

    const faltan = ORDEN.filter((t) => !mods[t]);

    if (faltan.length) {
        throw new Error(
            `Falta el Listado por Imputación Contable de: ${faltan.join(', ')}.`,
        );
    }

    const resuelto: SumasYSaldos = sys;
    const cons = consolidar(resuelto, mods);
    const validaciones = validar(resuelto, mods, cons, periodo);

    return {
        sys: resuelto,
        mods,
        cons,
        validaciones,
        avisos,
        empresa: resuelto.empresa,
        cuit: resuelto.cuit,
        hayError: validaciones.some((v) => v.nivel === 'ERROR'),
    };
}
