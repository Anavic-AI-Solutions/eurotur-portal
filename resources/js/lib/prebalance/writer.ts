/**
 * Generador del Excel de Pre-Balance.
 *
 * Construye el .xlsx replicando la estructura del archivo que arma hoy el área
 * contable:
 *
 *   Control       (nuevo)  tablero de validaciones
 *   Conciliacion  A:K      Extrae / Código / Descripción / Saldo inicial /
 *                          Débitos / Créditos / Saldo / Tesorería / Compras /
 *                          Ventas / Saldo Contable
 *   Tesoreria     detalle + Importe + resumen por cuenta
 *   Compras       ídem
 *   Ventas        ídem
 *
 * Diferencias deliberadas respecto del archivo manual:
 *  - No se arrastran las solapas históricas (SyS 2024, sumas, Contab, Ajustes
 *    DEBE 2020).
 *  - Los VLOOKUP de rango fijo se reemplazan por SUMIF sobre el detalle
 *    completo, por lo que el rango nunca queda corto.
 *  - Las celdas llevan fórmula Y valor calculado: el archivo es correcto al
 *    abrirlo, sin necesidad de recalcular.
 */
import type { Cell, Workbook, Worksheet } from 'exceljs';
import type { Modulo, ModuloTipo, Resultado } from './engine';
import { ORDEN } from './engine';

const MONEY = '#,##0.00';
const GRIS = 'FFD9D9D9';
const AZUL = 'FF1F4E79';
const VERDE = 'FFE2EFDA';
const AMAR = 'FFFFF2CC';
const ROJO = 'FFFCE4E4';

export type Meta = {
    periodoTexto: string;
    etiquetaCorta: string;
    etiquetaLarga: string;
    generado: string;
};

type Ref = { lastRow: number; importeLetter: string; extraeLetter: string };

export function colLetter(n: number): string {
    let s = '';

    while (n > 0) {
        const m = (n - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        n = (n - m - 1) / 26;
    }

    return s;
}

function fill(cell: Cell, argb: string): void {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function headerStyle(cell: Cell): void {
    cell.font = { bold: true, size: 10, color: { argb: 'FF000000' } };
    fill(cell, GRIS);
    cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
    };
    cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    };
}

function titleStyle(cell: Cell): void {
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    fill(cell, AZUL);
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

function hojaControl(wb: Workbook, res: Resultado, meta: Meta): Worksheet {
    const ws = wb.addWorksheet('Control', {
        views: [{ state: 'frozen', ySplit: 6 }],
    });
    ws.columns = [{ width: 4 }, { width: 40 }, { width: 12 }, { width: 95 }];

    ws.mergeCells('B1:D1');
    const t = ws.getCell('B1');
    t.value = 'PRE-BALANCE DE MODULOS  -  TABLERO DE CONTROL';
    titleStyle(t);
    ws.getRow(1).height = 24;

    const info: [string, string][] = [
        ['Empresa', res.empresa || '(no informada por Tango)'],
        ['C.U.I.T.', res.cuit || '-'],
        ['Periodo del ejercicio', meta.periodoTexto],
        ['Generado', meta.generado],
    ];
    info.forEach((p, i) => {
        const r = 2 + i;
        ws.getCell(`B${r}`).value = p[0];
        ws.getCell(`B${r}`).font = { bold: true, size: 10 };
        ws.mergeCells(`C${r}:D${r}`);
        ws.getCell(`C${r}`).value = p[1];
        ws.getCell(`C${r}`).font = { size: 10 };
    });

    const hr = 6;
    ['', 'Control', 'Resultado', 'Detalle'].forEach((h, i) => {
        if (i === 0) {
            return;
        }

        const c = ws.getCell(hr, i + 1);
        c.value = h;
        headerStyle(c);
    });
    ws.getRow(hr).height = 18;

    res.validaciones.forEach((v, i) => {
        const r = hr + 1 + i;
        ws.getCell(r, 2).value = v.control;
        ws.getCell(r, 3).value = v.nivel;
        ws.getCell(r, 4).value = v.detalle;
        ws.getCell(r, 2).font = { size: 10 };
        ws.getCell(r, 4).font = { size: 10 };
        ws.getCell(r, 4).alignment = { wrapText: true, vertical: 'top' };
        const c3 = ws.getCell(r, 3);
        c3.font = { bold: true, size: 10 };
        c3.alignment = { horizontal: 'center' };

        if (v.nivel === 'OK') {
            fill(c3, VERDE);
        } else if (v.nivel === 'ALERTA') {
            fill(c3, AMAR);
        } else if (v.nivel === 'ERROR') {
            fill(c3, ROJO);
        }

        [2, 3, 4].forEach((cc) => {
            ws.getCell(r, cc).border = {
                top: { style: 'hair' },
                left: { style: 'hair' },
                bottom: { style: 'hair' },
                right: { style: 'hair' },
            };
        });
    });

    const r2 = hr + res.validaciones.length + 2;
    ws.getCell(`B${r2}`).value = 'Archivos de origen utilizados';
    ws.getCell(`B${r2}`).font = { bold: true, size: 10 };
    const lista: [string, string][] = [
        ['Sumas y Saldos', res.sys.archivo ?? ''],
    ];
    ORDEN.forEach((t) => {
        const m = res.mods[t];

        if (m) {
            lista.push([`LXC ${t}`, m.archivo ?? '']);
        }
    });
    lista.forEach((p, i) => {
        const r = r2 + 1 + i;
        ws.getCell(`B${r}`).value = p[0];
        ws.mergeCells(`C${r}:D${r}`);
        ws.getCell(`C${r}`).value = p[1];
        ws.getCell(`B${r}`).font = { size: 10 };
        ws.getCell(`C${r}`).font = { size: 10 };
    });

    if (res.avisos.length) {
        const r3 = r2 + lista.length + 2;
        ws.getCell(`B${r3}`).value = 'Avisos';
        ws.getCell(`B${r3}`).font = { bold: true, size: 10 };
        res.avisos.forEach((a, i) => {
            ws.mergeCells(`B${r3 + 1 + i}:D${r3 + 1 + i}`);
            ws.getCell(`B${r3 + 1 + i}`).value = a;
            ws.getCell(`B${r3 + 1 + i}`).font = { size: 10 };
        });
    }

    return ws;
}

/**
 * Hoja de un módulo LXC.
 *
 *   A          = Extrae (=MID(B,1,6))
 *   B..ncols+1 = columnas originales del LXC de Tango
 *   importeCol = Importe (=Debe-Haber)
 *   resumenCol = resumen por cuenta (equivalente a la tabla dinámica)
 */
function hojaModulo(wb: Workbook, m: Modulo): Ref {
    const ws = wb.addWorksheet(m.tipo, {
        views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }],
    });
    const importeCol = m.ncols + 2;
    const resCol = importeCol + 3; // deja 2 columnas en blanco de separación
    const LA = 'A';
    const LI = colLetter(importeCol);
    const lastRow = m.filas.length + 1;

    // ---- encabezados
    const hdr = ['Extrae', ...m.headers, 'Importe'];
    hdr.forEach((h, i) => {
        const c = ws.getCell(1, i + 1);
        c.value = h;
        headerStyle(c);
    });
    ws.getRow(1).height = 28;

    // ---- detalle
    const colDebeOut = m.colDebe + 1;
    const colHaberOut = m.colHaber + 1;
    const LD = colLetter(colDebeOut);
    const LH = colLetter(colHaberOut);

    m.filas.forEach((f, i) => {
        const r = i + 2;
        const row = ws.getRow(r);
        row.getCell(1).value = { formula: `MID(B${r},1,6)`, result: f.cuenta };
        f.vals.forEach((v, k) => {
            row.getCell(k + 2).value = v === undefined ? null : v;
        });
        row.getCell(importeCol).value = {
            formula: `+${LD}${r}-${LH}${r}`,
            result: f.neto,
        };
        row.getCell(colDebeOut).numFmt = MONEY;
        row.getCell(colHaberOut).numFmt = MONEY;
        row.getCell(importeCol).numFmt = MONEY;
        row.commit();
    });

    // Saldo acumulado y Fecha con formato
    m.headers.forEach((h, k) => {
        const out = k + 2;
        const hn = h.toLowerCase();

        if (/fecha/.test(hn)) {
            ws.getColumn(out).numFmt = 'dd/mm/yyyy';
        }

        if (/saldo acumulado/.test(hn)) {
            ws.getColumn(out).numFmt = MONEY;
        }
    });

    // ---- resumen por cuenta (reemplaza la tabla dinámica manual)
    const rc = resCol;
    const rc2 = resCol + 1;
    const h1 = ws.getCell(2, rc);
    h1.value = 'Cuenta';
    headerStyle(h1);
    const h2 = ws.getCell(2, rc2);
    h2.value = 'Suma de Importe';
    headerStyle(h2);
    const Lrc = colLetter(rc);

    m.resumen.forEach((g, i) => {
        const r = 3 + i;
        ws.getCell(r, rc).value = g.cuenta;
        ws.getCell(r, rc2).value = {
            formula:
                `SUMIF($${LA}$2:$${LA}$${lastRow},${Lrc}${r}` +
                `,$${LI}$2:$${LI}$${lastRow})`,
            result: g.importe,
        };
        ws.getCell(r, rc2).numFmt = MONEY;
    });

    const totR = 3 + m.resumen.length;
    const ct = ws.getCell(totR, rc);
    ct.value = 'Total general';
    ct.font = { bold: true, size: 10 };
    fill(ct, GRIS);
    const cv = ws.getCell(totR, rc2);
    cv.value = {
        formula: `SUM(${colLetter(rc2)}3:${colLetter(rc2)}${totR - 1})`,
        result: m.totalNeto,
    };
    cv.numFmt = MONEY;
    cv.font = { bold: true, size: 10 };
    fill(cv, m.balancea ? VERDE : ROJO);

    const nota = ws.getCell(1, rc);
    nota.value = 'Resumen por cuenta (debe cerrar en 0)';
    nota.font = { bold: true, size: 9, italic: true, color: { argb: AZUL } };

    // ---- presentación
    ws.getColumn(1).width = 9;

    for (let c = 2; c <= importeCol; c++) {
        const h = (hdr[c - 1] || '').toLowerCase();
        ws.getColumn(c).width = /cuenta|razon social|concepto|descripcion/.test(
            h,
        )
            ? 34
            : /numero|comprobante/.test(h)
              ? 18
              : /debe|haber|saldo|importe/.test(h)
                ? 16
                : 12;
    }

    ws.getColumn(rc).width = 11;
    ws.getColumn(rc2).width = 18;
    ws.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: lastRow, column: importeCol },
    };

    return { lastRow, importeLetter: LI, extraeLetter: LA };
}

function hojaConciliacion(
    wb: Workbook,
    res: Resultado,
    refs: Record<ModuloTipo, Ref>,
    meta: Meta,
): Worksheet {
    const ws = wb.addWorksheet('Conciliacion', {
        views: [{ state: 'frozen', xSplit: 3, ySplit: 2 }],
    });

    ws.getCell('A1').value = 'Sumas y Saldos - Contabilidad';
    ws.getCell('A1').font = { bold: true, size: 10, color: { argb: AZUL } };
    ws.getCell('G1').value = `Balance al ${meta.etiquetaCorta}`;
    ws.getCell('G1').font = { bold: true, size: 10, color: { argb: AZUL } };
    ['H', 'I', 'J'].forEach((L) => {
        ws.getCell(`${L}1`).value = 'No exportados';
        ws.getCell(`${L}1`).font = {
            bold: true,
            size: 10,
            color: { argb: AZUL },
        };
    });
    ws.getCell('K1').value = `SyS ${meta.etiquetaLarga}`;
    ws.getCell('K1').font = { bold: true, size: 10, color: { argb: AZUL } };

    const heads = [
        'Extrae',
        'Codigo de cuenta',
        'Descripcion de cuenta',
        'Saldo inicial',
        'Debitos',
        'Creditos',
        'Saldo',
        `Saldo Tesoreria ${meta.etiquetaCorta}`,
        `Compras ${meta.etiquetaCorta}`,
        `Ventas ${meta.etiquetaCorta}`,
        'Saldo Contable',
    ];
    heads.forEach((h, i) => {
        const c = ws.getCell(2, i + 1);
        c.value = h;
        headerStyle(c);
    });
    ws.getRow(2).height = 30;

    const map: Record<ModuloTipo, number> = {
        Tesoreria: 8,
        Compras: 9,
        Ventas: 10,
    };
    res.cons.filas.forEach((f, i) => {
        const r = i + 3;
        const row = ws.getRow(r);
        row.getCell(1).value = { formula: `MID(B${r},1,6)`, result: f.extrae };
        row.getCell(2).value = f.codigo;
        row.getCell(3).value = f.desc;
        row.getCell(4).value = f.saldoIni;
        row.getCell(5).value = f.debitos;
        row.getCell(6).value = f.creditos;
        row.getCell(7).value = f.saldo;

        ORDEN.forEach((t) => {
            const ref = refs[t];
            row.getCell(map[t]).value = {
                formula:
                    `SUMIF(${t}!$${ref.extraeLetter}$2:$${ref.extraeLetter}$${ref.lastRow}` +
                    `,$A${r},` +
                    `${t}!$${ref.importeLetter}$2:$${ref.importeLetter}$${ref.lastRow})`,
                result: f[t],
            };
        });

        row.getCell(11).value = {
            formula: `SUM(G${r}:J${r})`,
            result: f.saldoContable,
        };

        for (let c = 4; c <= 11; c++) {
            row.getCell(c).numFmt = MONEY;
        }

        row.commit();
    });

    const lastRow = res.cons.filas.length + 2;
    const tr = lastRow + 1;
    const trow = ws.getRow(tr);
    trow.getCell(3).value = 'TOTALES';
    const totMap: Record<number, keyof Resultado['cons']['totales']> = {
        4: 'saldoIni',
        5: 'debitos',
        6: 'creditos',
        7: 'saldo',
        8: 'Tesoreria',
        9: 'Compras',
        10: 'Ventas',
        11: 'saldoContable',
    };
    Object.keys(totMap).forEach((key) => {
        const c = Number(key);
        const L = colLetter(c);
        const cell = trow.getCell(c);
        cell.value = {
            formula: `SUM(${L}3:${L}${lastRow})`,
            result: res.cons.totales[totMap[c]],
        };
        cell.numFmt = MONEY;
    });

    for (let c = 1; c <= 11; c++) {
        const cell = trow.getCell(c);
        cell.font = { bold: true, size: 10 };
        fill(cell, GRIS);
        cell.border = { top: { style: 'double' } };
    }

    // resaltar el control de cero de los tres módulos
    [8, 9, 10].forEach((c) => {
        const ok =
            Math.abs(Math.round(res.cons.totales[totMap[c]] * 100) / 100) <=
            0.005;
        fill(trow.getCell(c), ok ? VERDE : ROJO);
    });

    [9, 16, 42, 16, 16, 16, 16, 18, 18, 18, 18].forEach((x, i) => {
        ws.getColumn(i + 1).width = x;
    });
    ws.autoFilter = {
        from: { row: 2, column: 1 },
        to: { row: lastRow, column: 11 },
    };

    return ws;
}

function hojaHuerfanas(wb: Workbook, res: Resultado): void {
    if (!res.cons.huerfanas.length) {
        return;
    }

    const ws = wb.addWorksheet('Cuentas sin match');
    ws.columns = [{ width: 14 }, { width: 12 }, { width: 45 }, { width: 20 }];
    ['Modulo', 'Cuenta', 'Descripcion en el modulo', 'Importe neto'].forEach(
        (h, i) => {
            const c = ws.getCell(1, i + 1);
            c.value = h;
            headerStyle(c);
        },
    );
    res.cons.huerfanas.forEach((h, i) => {
        const r = i + 2;
        ws.getCell(r, 1).value = h.modulo;
        ws.getCell(r, 2).value = h.cuenta;
        ws.getCell(r, 3).value = h.desc;
        ws.getCell(r, 4).value = h.importe;
        ws.getCell(r, 4).numFmt = MONEY;
    });
}

export function construir(
    ExcelJS: { Workbook: new () => Workbook },
    res: Resultado,
    meta: Meta,
): Workbook {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Armado de Pre-Balance de Modulos';
    wb.created = new Date();

    // Los rangos de cada módulo se conocen antes de escribirlos, así que las
    // solapas se pueden crear ya en el orden final que ve el área contable.
    const refs = {} as Record<ModuloTipo, Ref>;
    ORDEN.forEach((t) => {
        const m = res.mods[t];

        if (!m) {
            throw new Error(`Falta el módulo ${t}.`);
        }

        refs[t] = {
            lastRow: m.filas.length + 1,
            importeLetter: colLetter(m.ncols + 2),
            extraeLetter: 'A',
        };
    });

    hojaControl(wb, res, meta);
    hojaConciliacion(wb, res, refs, meta);
    ORDEN.forEach((t) => {
        const m = res.mods[t];

        if (m) {
            hojaModulo(wb, m);
        }
    });
    hojaHuerfanas(wb, res);

    return wb;
}
