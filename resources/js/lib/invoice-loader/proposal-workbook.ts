/**
 * Lectura/escritura de la hoja "Propuesta" del cargador de facturas.
 *
 * Recibe un Workbook ya cargado por ExcelJS (la página es quien hace el
 * `import('exceljs')` diferido) y expone funciones puras, en la misma línea
 * que `lib/prebalance/engine.ts`.
 *
 * El hash de integridad (`_Hash`) del microservicio se calcula sólo a partir
 * de 10 columnas de valor (ver docs/Consumo_API.md) — nunca de bytes o
 * formato del archivo — así que alcanza con no tocar ninguna celda salvo
 * `APROBADO` y `Voucher_corregido` para no romperlo.
 */
import type { CellValue, Workbook, Worksheet } from 'exceljs';

export const SHEET_NAME = 'Propuesta';

export type ProposalRow = {
    /** Fila real dentro de la hoja de Excel — necesaria para reescribir la celda correcta. */
    _rowNumber: number;
    Estado: string;
    Motivo: string;
    Proveedor: string;
    RazonSocial_Tango: string;
    NombreAcreedor_TP: string;
    Numero_Tango: string;
    Reference_a_cargar: string;
    Fecha: string;
    Vencimiento: string;
    Moneda: string;
    Importe_factura: string;
    Importe_USD: string;
    File_detectado: string;
    Voucher_propuesto: string;
    Voucher_ServiceDate: string;
    Voucher_Option: string;
    Voucher_saldo_propuesto: string;
    Diferencia: string;
    Vouchers_descartados: string;
    Analista: string;
    APROBADO: string;
    Voucher_corregido: string;
    _Hash: string;
};

/** Columnas de la hoja "Propuesta", tal como las documenta la API — el orden real no importa acá, se leen por nombre de encabezado. */
const COLUMN_NAMES = [
    'Estado',
    'Motivo',
    'Proveedor',
    'RazonSocial_Tango',
    'NombreAcreedor_TP',
    'Numero_Tango',
    'Reference_a_cargar',
    'Fecha',
    'Vencimiento',
    'Moneda',
    'Importe_factura',
    'Importe_USD',
    'File_detectado',
    'Voucher_propuesto',
    'Voucher_ServiceDate',
    'Voucher_Option',
    'Voucher_saldo_propuesto',
    'Diferencia',
    'Vouchers_descartados',
    'Analista',
    'APROBADO',
    'Voucher_corregido',
    '_Hash',
] as const satisfies readonly Exclude<keyof ProposalRow, '_rowNumber'>[];

type ColumnMap = Record<(typeof COLUMN_NAMES)[number], number>;

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

function findSheet(workbook: Workbook): Worksheet {
    const sheet = workbook.getWorksheet(SHEET_NAME);

    if (!sheet) {
        throw new Error(`El Excel no tiene una hoja "${SHEET_NAME}".`);
    }

    return sheet;
}

function columnMap(sheet: Worksheet): ColumnMap {
    const found: Partial<Record<string, number>> = {};

    sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, col) => {
        const name = cellText(cell.value).trim();

        if (name) {
            found[name] = col;
        }
    });

    const missing = COLUMN_NAMES.filter((name) => !(name in found));

    if (missing.length > 0) {
        throw new Error(
            `Al Excel le faltan columnas esperadas: ${missing.join(', ')}.`,
        );
    }

    return found as ColumnMap;
}

/** Lee la hoja "Propuesta" a filas editables. Sólo lectura — no modifica el workbook. */
export function readProposalRows(workbook: Workbook): ProposalRow[] {
    const sheet = findSheet(workbook);
    const columns = columnMap(sheet);
    const rows: ProposalRow[] = [];
    const lastRow = Math.max(sheet.actualRowCount, sheet.rowCount);

    for (let r = 2; r <= lastRow; r++) {
        const row = sheet.getRow(r);
        const value = (name: (typeof COLUMN_NAMES)[number]) =>
            cellText(row.getCell(columns[name]).value).trim();

        const proveedor = value('Proveedor');

        if (!proveedor) {
            continue;
        }

        const estado = value('Estado');

        rows.push({
            _rowNumber: r,
            Estado: estado,
            Motivo: value('Motivo'),
            Proveedor: proveedor,
            RazonSocial_Tango: value('RazonSocial_Tango'),
            NombreAcreedor_TP: value('NombreAcreedor_TP'),
            Numero_Tango: value('Numero_Tango'),
            Reference_a_cargar: value('Reference_a_cargar'),
            Fecha: value('Fecha'),
            Vencimiento: value('Vencimiento'),
            Moneda: value('Moneda'),
            Importe_factura: value('Importe_factura'),
            Importe_USD: value('Importe_USD'),
            File_detectado: value('File_detectado'),
            Voucher_propuesto: value('Voucher_propuesto'),
            Voucher_ServiceDate: value('Voucher_ServiceDate'),
            Voucher_Option: value('Voucher_Option'),
            Voucher_saldo_propuesto: value('Voucher_saldo_propuesto'),
            Diferencia: value('Diferencia'),
            Vouchers_descartados: value('Vouchers_descartados'),
            Analista: value('Analista'),
            // Default: pre-completar SI en las filas ya listas — el humano revisa y puede cambiarlo.
            APROBADO: estado === 'LISTA' ? 'SI' : value('APROBADO'),
            Voucher_corregido: value('Voucher_corregido'),
            _Hash: value('_Hash'),
        });
    }

    return rows;
}

/**
 * Escribe únicamente APROBADO/Voucher_corregido sobre el mismo workbook
 * cargado — nunca reconstruye la hoja, para no arriesgar ninguna de las
 * columnas que alimentan el hash de integridad.
 */
export function applyApprovals(workbook: Workbook, rows: ProposalRow[]): void {
    const sheet = findSheet(workbook);
    const columns = columnMap(sheet);

    for (const row of rows) {
        const sheetRow = sheet.getRow(row._rowNumber);
        sheetRow.getCell(columns.APROBADO).value = row.APROBADO;
        sheetRow.getCell(columns.Voucher_corregido).value =
            row.Voucher_corregido;
    }
}
