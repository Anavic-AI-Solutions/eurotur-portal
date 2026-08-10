/**
 * Comprobantes adjuntos: resize/compresión a JPEG y embebido en el Excel
 * oficial vía drawingML, igual que hace Excel al pegar una imagen.
 *
 * Porte 1:1 de las funciones de imágenes del panel HTML autónomo.
 */
import type JSZipType from 'jszip';
import {
    JPEG_QUALITY,
    MAX_IMAGE_DIM,
    fmtByMoneda,
    gastoMoneda,
    gastoTotal,
} from './engine';
import type { ComprobanteImagen, Gasto } from './engine';
import { escapeXml } from './writer';

const EMU_PER_PX = 9525;
const ROW_HEIGHT_EMU = 14.25 * 12700; // altura de fila por default de la hoja
const EMBED_WIDTH_PX = 500;

export type ComprobanteConIndice = { g: Gasto; i: number };

/** Redimensiona (lado mayor a MAX_IMAGE_DIM) y comprime un archivo a JPEG. */
export function procesarComprobante(file: File): Promise<ComprobanteImagen> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () =>
                reject(new Error('No se pudo leer la imagen del comprobante.'));
            img.onload = () => {
                let { width, height } = img;

                if (Math.max(width, height) > MAX_IMAGE_DIM) {
                    const scale = MAX_IMAGE_DIM / Math.max(width, height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d')!;
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, width, height); // aplana transparencia para jpeg
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
                resolve({ dataUrl, mime: 'image/jpeg', cx: width, cy: height });
            };
            img.src = e.target!.result as string;
        };
        reader.readAsDataURL(file);
    });
}

function b64ToUint8Array(b64: string): Uint8Array {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);

    for (let i = 0; i < bin.length; i++) {
        arr[i] = bin.charCodeAt(i);
    }

    return arr;
}

function injectLabelRow(
    sheetXml: string,
    rowNum: number,
    escapedLabel: string,
): string {
    const rowRe = new RegExp(
        `<row r="${rowNum}"[^>]*>[\\s\\S]*?</row>|<row r="${rowNum}"[^>]*/>`,
    );
    const m = sheetXml.match(rowRe);
    const newRow = `<row r="${rowNum}"><c r="A${rowNum}" t="inlineStr"><is><t xml:space="preserve">${escapedLabel}</t></is></c></row>`;

    if (m) {
        return (
            sheetXml.slice(0, m.index) +
            newRow +
            sheetXml.slice(m.index! + m[0].length)
        );
    }

    return sheetXml.replace('</sheetData>', newRow + '</sheetData>');
}

/**
 * Embebe cada foto de comprobante adjunta en la hoja de comprobantes indicada
 * ("cmptes en ARS" = sheet3, "cmptes en otras monedas" = sheet4), apiladas
 * verticalmente con una etiqueta de texto por gasto.
 */
export async function embedImages(
    zip: InstanceType<typeof JSZipType>,
    conImagen: ComprobanteConIndice[],
    sheetPath: string,
): Promise<void> {
    const names = Object.keys(zip.files);
    const existingNums = names
        .map((n) => {
            const m = n.match(/^xl\/media\/image(\d+)\./);

            return m ? parseInt(m[1], 10) : null;
        })
        .filter((n): n is number => n !== null);
    let nextNum = existingNums.length ? Math.max(...existingNums) + 1 : 1;

    let sheetXml = await zip.file(sheetPath)!.async('string');

    const drawingParts: string[] = [];
    const relsParts: string[] = [];
    let rowCursor = 1; // próxima fila de etiqueta, 0-based
    let picId = 2;

    for (const { g, i } of conImagen) {
        const { dataUrl, cx: origW, cy: origH } = g.comprobante_image!;
        const scale = EMBED_WIDTH_PX / origW;
        const cx = Math.round(EMBED_WIDTH_PX * EMU_PER_PX);
        const cy = Math.round(origH * scale * EMU_PER_PX);

        const labelRow1Based = rowCursor + 1;
        const imageRowIndex = rowCursor + 1; // 0-based, justo debajo de la etiqueta
        const label =
            `Gasto ${i + 1} - ${g.proveedor || ''} - ${fmtByMoneda(gastoTotal(g), gastoMoneda(g))}`
                .replace(/\s+/g, ' ')
                .trim();
        const esc = escapeXml(label);
        sheetXml = injectLabelRow(sheetXml, labelRow1Based, esc);

        const mediaName = `image${nextNum}.jpg`;
        nextNum++;
        const rid = `rId${relsParts.length + 1}`;
        const base64Data = dataUrl.split(',')[1];
        zip.file(`xl/media/${mediaName}`, b64ToUint8Array(base64Data));
        relsParts.push(
            `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaName}"/>`,
        );

        picId++;
        drawingParts.push(
            `<xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${imageRowIndex}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>` +
                `<xdr:ext cx="${cx}" cy="${cy}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${picId}" name="Comprobante ${i + 1}"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>` +
                `<xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>` +
                `<xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`,
        );

        const rowsUsed = Math.ceil(cy / ROW_HEIGHT_EMU);
        rowCursor = rowCursor + 1 + rowsUsed + 1;
    }

    const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${drawingParts.join('')}</xdr:wsDr>`;
    const drawingRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relsParts.join('')}</Relationships>`;

    // busca un nombre de parte de dibujo libre (drawing1.xml ya lo usa "cmptes en otras monedas")
    let drawingNum = 1;

    while (names.includes(`xl/drawings/drawing${drawingNum}.xml`)) {
        drawingNum++;
    }

    const drawingPath = `xl/drawings/drawing${drawingNum}.xml`;

    zip.file(drawingPath, drawingXml);
    zip.file(`xl/drawings/_rels/drawing${drawingNum}.xml.rels`, drawingRels);

    const sheetFileName = sheetPath.split('/').pop()!;
    const sheetRelsPath = `xl/worksheets/_rels/${sheetFileName}.rels`;
    const sheetRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${drawingNum}.xml"/></Relationships>`;
    zip.file(sheetRelsPath, sheetRelsXml);

    if (!sheetXml.includes('<drawing ')) {
        sheetXml = sheetXml.replace(
            '</worksheet>',
            '<drawing r:id="rId1"/></worksheet>',
        );
    }

    zip.file(sheetPath, sheetXml);

    let contentTypes = await zip.file('[Content_Types].xml')!.async('string');

    if (!contentTypes.includes(`/xl/drawings/drawing${drawingNum}.xml`)) {
        contentTypes = contentTypes.replace(
            '</Types>',
            `<Override PartName="/xl/drawings/drawing${drawingNum}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>`,
        );
    }

    if (
        !contentTypes.includes('Extension="jpg"') &&
        !contentTypes.includes('Extension="jpeg"')
    ) {
        contentTypes = contentTypes.replace(
            '</Types>',
            `<Default Extension="jpg" ContentType="image/jpeg"/></Types>`,
        );
    }

    zip.file('[Content_Types].xml', contentTypes);
}
