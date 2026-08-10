/**
 * Generación del Excel oficial de rendición de gastos.
 *
 * Porte 1:1 del bloque `generarExcel` del panel HTML autónomo: parchea sólo
 * las celdas de entrada cruda de la plantilla oficial ("Gastos en ARS" /
 * "Gastos en Moneda Extranjera"), dejando fórmulas, estilos y validaciones de
 * datos intactos byte a byte. No reordenar ni "limpiar" — cualquier corrimiento
 * de fila o de referencia de celda rompe la rendición en silencio.
 */
import type JSZipType from 'jszip';
import { gastoMoneda, gastoTotal, nombreArchivo } from './engine';
import type { Gasto, Header } from './engine';
import { embedImages } from './images';
import type { ComprobanteConIndice } from './images';

const PLANTILLA_URL = '/plantillas/rendicion-gastos.xlsx';

const SHEET_PATH = 'xl/worksheets/sheet1.xml'; // = "Gastos en ARS"
const SHEET_USD_PATH = 'xl/worksheets/sheet2.xml'; // = "Gastos en Moneda Extranjera"
const SHEET_CMPTES_PATH = 'xl/worksheets/sheet3.xml'; // = "cmptes en ARS"
const SHEET_CMPTES_EXT_PATH = 'xl/worksheets/sheet4.xml'; // = "cmptes en otras monedas"

export function colLetter(n: number): string {
    let s = '';

    while (n > 0) {
        const rem = (n - 1) % 26;
        s = String.fromCharCode(65 + rem) + s;
        n = Math.floor((n - 1) / 26);
    }

    return s;
}

export function isoToSerial(isoDate: string): number {
    const [y, m, d] = isoDate.split('-').map(Number);
    const utcDate = Date.UTC(y, m - 1, d);
    const epoch = Date.UTC(1899, 11, 30);

    return Math.round((utcDate - epoch) / 86400000);
}

export function escapeXml(s: unknown): string {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export function patchCell(
    xml: string,
    ref: string,
    type: 'n' | 'str',
    value: string | number,
): string {
    const re = new RegExp(`<c r="${ref}"([^>]*?)(/>|>[\\s\\S]*?</c>)`);
    const m = xml.match(re);

    if (!m) {
        throw new Error(
            `No se encontró la celda ${ref} en la plantilla (posible corrupción del archivo base).`,
        );
    }

    const attrs = m[1].replace(/\s+t="[^"]*"/, '');
    const newCell =
        type === 'n'
            ? `<c r="${ref}"${attrs}><v>${value}</v></c>`
            : `<c r="${ref}"${attrs} t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;

    return xml.slice(0, m.index) + newCell + xml.slice(m.index! + m[0].length);
}

export function blankCell(xml: string, ref: string): string {
    const re = new RegExp(`<c r="${ref}"([^>]*?)(/>|>[\\s\\S]*?</c>)`);
    const m = xml.match(re);

    if (!m) {
        return xml;
    }

    const attrs = m[1].replace(/\s+t="[^"]*"/, '');
    const newCell = `<c r="${ref}"${attrs}/>`;

    return xml.slice(0, m.index) + newCell + xml.slice(m.index! + m[0].length);
}

type FieldRow = [row: number, type: 'n' | 'str' | 'date'];

const FIELD_ROWS: Record<string, FieldRow> = {
    file_numero: [9, 'str'],
    fecha: [10, 'date'],
    proveedor: [11, 'str'],
    tipo_gasto: [12, 'str'],
    cuit: [14, 'n'],
    letra_factura: [16, 'str'],
    talonario: [17, 'n'],
    numero_comprobante: [18, 'str'],
    importe_neto: [19, 'n'],
    iva_27: [20, 'n'],
    iva_21: [21, 'n'],
    iva_105: [22, 'n'],
    percepcion_iva: [23, 'n'],
    percepcion_iibb_caba: [24, 'n'],
    percepcion_iibb_sc: [25, 'n'],
    percepcion_iibb_tdf: [26, 'n'],
    otros_cargos: [27, 'n'],
    forma_pago: [29, 'str'],
};

// Mapeo de filas de "Gastos en Moneda Extranjera" en la plantilla LIMPIA
// (Version 20260721 Form gastos (copiar no editar).xlsx). Esta plantilla ya
// NO tiene la fila "número del comprobante" que sí tenía la plantilla vieja
// (EAJR20260720.xlsx) — todo se corrió una fila hacia arriba. Verificado
// campo por campo contra el archivo limpio antes de tocar este mapeo.
const FIELD_ROWS_USD: Record<string, FieldRow> = {
    file_numero: [9, 'str'],
    fecha: [10, 'date'],
    proveedor: [11, 'str'],
    concepto_ext: [12, 'str'],
    moneda_iso: [14, 'str'],
    importe_original: [15, 'n'],
    tipo_cambio_a_dolares: [16, 'n'],
    forma_pago: [18, 'str'],
};

/**
 * NOTE: el `[^>]*?` debe ser non-greedy — un `[^>]*` greedy se come la "/"
 * final de un `<f .../>` self-closing de fórmula compartida, lo que hace que
 * el motor no reconozca el tag como cerrado y retroceda hasta el próximo
 * `</f>` no relacionado en el documento (saltando en silencio el clear de la
 * celda que quedó en ese borde, p. ej. fórmulas de validación compartidas
 * como "valida encabezado"/"valida carga de datos").
 */
export function clearCachedFormulas(xml: string): string {
    return xml.replace(
        /(<f[^>]*?(?:\/>|>[\s\S]*?<\/f>))<v>[^<]*<\/v>/g,
        '$1<v></v>',
    );
}

async function cargarPlantilla(
    JSZip: typeof JSZipType,
): Promise<InstanceType<typeof JSZipType>> {
    const res = await fetch(PLANTILLA_URL);

    if (!res.ok) {
        throw new Error(
            'No se pudo cargar la plantilla oficial de rendición de gastos.',
        );
    }

    const buffer = await res.arrayBuffer();

    return JSZip.loadAsync(buffer);
}

export type GenerarExcelResultado = {
    blob: Blob;
    filename: string;
    conImagenes: number;
};

export async function generarExcel(
    header: Header,
    gastos: Gasto[],
    rendicionTipo: 'ARS' | 'EXTRANJERA',
): Promise<GenerarExcelResultado> {
    const { default: JSZip } = await import('jszip');
    const zip = await cargarPlantilla(JSZip);

    const arsGastos = gastos.filter((g) => g.monedaTipo !== 'EXTRANJERA');
    const extGastos = gastos.filter((g) => g.monedaTipo === 'EXTRANJERA');

    // ---- Sheet 1: Gastos en ARS ----
    let xml = await zip.file(SHEET_PATH)!.async('string');
    xml = patchCell(xml, 'G1', 'n', header.numero_rendicion);
    xml = patchCell(xml, 'B2', 'str', header.empresa);
    xml = patchCell(xml, 'B3', 'str', header.nombre_apellido);
    xml = patchCell(xml, 'F3', 'str', header.iniciales);
    xml = patchCell(xml, 'B4', 'n', isoToSerial(header.fecha_gasto));
    xml = patchCell(xml, 'B5', 'str', header.concepto_rendicion);

    arsGastos.forEach((g, idx) => {
        const col = colLetter(idx + 2);
        const record: Record<string, string> = {
            file_numero: g.esFile ? g.file_numero : 'GRAL999999',
            fecha: g.fecha,
            proveedor: g.proveedor,
            tipo_gasto: g.esFile ? '' : g.tipo_gasto,
            cuit: g.sinComprobante ? '' : g.cuit,
            letra_factura: g.letra_factura,
            talonario: g.sinComprobante ? '' : g.talonario,
            numero_comprobante: g.sinComprobante ? '' : g.numero_comprobante,
            importe_neto: g.importe_neto,
            iva_27: g.sinComprobante ? '' : g.iva_27,
            iva_21: g.sinComprobante ? '' : g.iva_21,
            iva_105: g.sinComprobante ? '' : g.iva_105,
            percepcion_iva: g.sinComprobante ? '' : g.percepcion_iva,
            percepcion_iibb_caba: g.sinComprobante
                ? ''
                : g.percepcion_iibb_caba,
            percepcion_iibb_sc: g.sinComprobante ? '' : g.percepcion_iibb_sc,
            percepcion_iibb_tdf: g.sinComprobante ? '' : g.percepcion_iibb_tdf,
            otros_cargos: g.sinComprobante ? '' : g.otros_cargos,
            forma_pago: g.forma_pago,
        };

        for (const [field, [row, type]] of Object.entries(FIELD_ROWS)) {
            const val = record[field];

            if (val === undefined || val === null || val === '') {
                continue;
            }

            const ref = `${col}${row}`;
            xml =
                field === 'fecha'
                    ? patchCell(xml, ref, 'n', isoToSerial(val))
                    : patchCell(xml, ref, type === 'date' ? 'n' : type, val);
        }
    });
    xml = clearCachedFormulas(xml);
    zip.file(SHEET_PATH, xml);

    // ---- Sheet 2: Gastos en Moneda Extranjera (only if used) ----
    if (extGastos.length > 0) {
        let xmlUsd = await zip.file(SHEET_USD_PATH)!.async('string');
        xmlUsd = patchCell(xmlUsd, 'B2', 'str', header.empresa);
        xmlUsd = patchCell(xmlUsd, 'B3', 'str', header.nombre_apellido);
        xmlUsd = patchCell(xmlUsd, 'F3', 'str', header.iniciales);
        xmlUsd = patchCell(xmlUsd, 'B4', 'n', isoToSerial(header.fecha_gasto));
        xmlUsd = patchCell(xmlUsd, 'B5', 'str', header.concepto_rendicion);
        xmlUsd = patchCell(xmlUsd, 'B6', 'n', header.tipo_cambio_general);
        // G1 se deja intacta: es una fórmula que lee 'Gastos en ARS'!G1

        extGastos.forEach((g, idx) => {
            const col = colLetter(idx + 2);
            const record: Record<string, string> = {
                file_numero: g.esFile ? g.file_numero : 'GRAL999999',
                fecha: g.fecha,
                proveedor: g.proveedor,
                concepto_ext: g.concepto_ext,
                moneda_iso: g.moneda_iso,
                importe_original: g.importe_original,
                tipo_cambio_a_dolares: g.tipo_cambio_a_dolares,
                forma_pago: g.forma_pago,
            };

            for (const [field, [row, type]] of Object.entries(FIELD_ROWS_USD)) {
                const val = record[field];

                if (val === undefined || val === null || val === '') {
                    continue;
                }

                const ref = `${col}${row}`;
                xmlUsd =
                    field === 'fecha'
                        ? patchCell(xmlUsd, ref, 'n', isoToSerial(val))
                        : patchCell(
                              xmlUsd,
                              ref,
                              type === 'date' ? 'n' : type,
                              val,
                          );
            }
        });
        xmlUsd = clearCachedFormulas(xmlUsd);
        zip.file(SHEET_USD_PATH, xmlUsd);
    } else {
        // La plantilla base todavía tiene 3 valores literales sueltos en "Gastos en
        // Moneda Extranjera" (iniciales F3, fecha B4, tipo de cambio B6) que NO son
        // fórmulas, así que en una rendición sólo-ARS se filtrarían sin tocar a la
        // descarga. Se blanquean porque esta hoja no se usa esta vez.
        let xmlUsd = await zip.file(SHEET_USD_PATH)!.async('string');
        xmlUsd = blankCell(xmlUsd, 'F3');
        xmlUsd = blankCell(xmlUsd, 'B4');
        xmlUsd = blankCell(xmlUsd, 'B6');
        zip.file(SHEET_USD_PATH, xmlUsd);
    }

    // La plantilla base tiene un fragmento de texto suelto en A1 de "cmptes en
    // otras monedas" ("cmp"); se limpia para que nunca aparezca en una descarga.
    let xmlCmptesExt = await zip.file(SHEET_CMPTES_EXT_PATH)!.async('string');
    xmlCmptesExt = blankCell(xmlCmptesExt, 'A1');
    zip.file(SHEET_CMPTES_EXT_PATH, xmlCmptesExt);

    // ---- Comprobantes adjuntos -> "cmptes en ARS" o "cmptes en otras monedas" ----
    // Una rendición es de un solo tipo de moneda (elegido en el paso 1), así que
    // todos los comprobantes de esta descarga van a la misma hoja de destino.
    const conImagen: ComprobanteConIndice[] = gastos
        .map((g, i) => ({ g, i }))
        .filter((x) => x.g.comprobante_image);

    if (conImagen.length > 0) {
        const targetSheet =
            rendicionTipo === 'EXTRANJERA'
                ? SHEET_CMPTES_EXT_PATH
                : SHEET_CMPTES_PATH;
        await embedImages(zip, conImagen, targetSheet);
    }

    // Fuerza el recálculo completo al abrir (Excel/LibreOffice/Sheets no deben
    // confiar en valores de fórmula cacheados, ya que se pasa por alto el
    // camino normal de edición).
    let wbXml = await zip.file('xl/workbook.xml')!.async('string');

    if (!wbXml.includes('fullCalcOnLoad')) {
        wbXml = wbXml.includes('<calcPr')
            ? wbXml.replace(
                  /<calcPr([^/]*)\/>/,
                  '<calcPr$1 fullCalcOnLoad="1"/>',
              )
            : wbXml.replace(
                  '</workbook>',
                  '<calcPr fullCalcOnLoad="1"/></workbook>',
              );
    }

    zip.file('xl/workbook.xml', wbXml);

    if (zip.file('xl/calcChain.xml')) {
        zip.remove('xl/calcChain.xml');
        let ct = await zip.file('[Content_Types].xml')!.async('string');
        ct = ct.replace(
            /<Override PartName="\/xl\/calcChain\.xml"[^/]*\/>/,
            '',
        );
        zip.file('[Content_Types].xml', ct);
        let rels = await zip
            .file('xl/_rels/workbook.xml.rels')!
            .async('string');
        rels = rels.replace(/<Relationship[^>]*calcChain\.xml[^>]*\/>/, '');
        zip.file('xl/_rels/workbook.xml.rels', rels);
    }

    const blob = (await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
    })) as Blob;

    return {
        blob,
        filename: nombreArchivo(header),
        conImagenes: conImagen.length,
    };
}

export { gastoMoneda, gastoTotal };
