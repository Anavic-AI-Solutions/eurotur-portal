import { ChevronDown, ChevronRight } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { ProposalRow } from '@/lib/invoice-loader/proposal-workbook';

const ESTADO_VARIANT: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    LISTA: 'default',
    REVISAR: 'outline',
    BLOQUEADA: 'destructive',
    DESCARTADA: 'destructive',
    YA_EXISTIA: 'secondary',
};

const DETAIL_COLSPAN = 9;

function EstadoBadge({ estado }: { estado: string }) {
    return (
        <Badge variant={ESTADO_VARIANT[estado] ?? 'outline'}>{estado}</Badge>
    );
}

function DetailField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="bo-label text-muted-foreground">{label}</div>
            <div className="text-sm">{value || '—'}</div>
        </div>
    );
}

/** Editable table for the "Propuesta" rows — only APROBADO/Voucher_corregido are writable. */
export function InvoiceLoaderProposalTable({
    rows,
    onChange,
}: {
    rows: ProposalRow[];
    onChange: (rowNumber: number, patch: Partial<ProposalRow>) => void;
}) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    function toggle(rowNumber: number) {
        setExpanded((prev) => {
            const next = new Set(prev);

            if (next.has(rowNumber)) {
                next.delete(rowNumber);
            } else {
                next.add(rowNumber);
            }

            return next;
        });
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-8">
                        <span className="sr-only">Detalle</span>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Importe</TableHead>
                    <TableHead>Voucher propuesto</TableHead>
                    <TableHead>Diferencia</TableHead>
                    <TableHead>Aprobado</TableHead>
                    <TableHead>Voucher corregido</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => {
                    const isOpen = expanded.has(row._rowNumber);

                    return (
                        <Fragment key={row._rowNumber}>
                            <TableRow>
                                <TableCell>
                                    <button
                                        type="button"
                                        onClick={() => toggle(row._rowNumber)}
                                        className="text-muted-foreground hover:text-foreground"
                                        aria-label={
                                            isOpen
                                                ? 'Ocultar detalle'
                                                : 'Ver detalle'
                                        }
                                    >
                                        {isOpen ? (
                                            <ChevronDown className="size-4" />
                                        ) : (
                                            <ChevronRight className="size-4" />
                                        )}
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <EstadoBadge estado={row.Estado} />
                                </TableCell>
                                <TableCell className="font-medium">
                                    {row.Proveedor}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {row.Motivo || '—'}
                                </TableCell>
                                <TableCell className="text-sm whitespace-nowrap">
                                    {row.Importe_factura} {row.Moneda}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {row.Voucher_propuesto || '—'}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {row.Diferencia || '—'}
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={row.APROBADO || '_none'}
                                        onValueChange={(value) =>
                                            onChange(row._rowNumber, {
                                                APROBADO:
                                                    value === '_none'
                                                        ? ''
                                                        : value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="w-28 rounded-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_none">
                                                Sin decidir
                                            </SelectItem>
                                            <SelectItem value="SI">
                                                SI
                                            </SelectItem>
                                            <SelectItem value="NO">
                                                NO
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={row.Voucher_corregido}
                                        onChange={(e) =>
                                            onChange(row._rowNumber, {
                                                Voucher_corregido:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="Opcional"
                                        className="w-32 rounded-none"
                                    />
                                </TableCell>
                            </TableRow>

                            {isOpen && (
                                <TableRow>
                                    <TableCell
                                        colSpan={DETAIL_COLSPAN}
                                        className="bg-muted/30"
                                    >
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-2 sm:grid-cols-4">
                                            <DetailField
                                                label="Razón social (Tango)"
                                                value={row.RazonSocial_Tango}
                                            />
                                            <DetailField
                                                label="Acreedor (Tourplan)"
                                                value={row.NombreAcreedor_TP}
                                            />
                                            <DetailField
                                                label="Número (Tango)"
                                                value={row.Numero_Tango}
                                            />
                                            <DetailField
                                                label="Reference a cargar"
                                                value={row.Reference_a_cargar}
                                            />
                                            <DetailField
                                                label="Fecha"
                                                value={row.Fecha}
                                            />
                                            <DetailField
                                                label="Vencimiento"
                                                value={row.Vencimiento}
                                            />
                                            <DetailField
                                                label="Importe USD"
                                                value={row.Importe_USD}
                                            />
                                            <DetailField
                                                label="File detectado"
                                                value={row.File_detectado}
                                            />
                                            <DetailField
                                                label="Voucher ServiceDate"
                                                value={row.Voucher_ServiceDate}
                                            />
                                            <DetailField
                                                label="Voucher Option"
                                                value={row.Voucher_Option}
                                            />
                                            <DetailField
                                                label="Voucher saldo propuesto"
                                                value={
                                                    row.Voucher_saldo_propuesto
                                                }
                                            />
                                            <DetailField
                                                label="Vouchers descartados"
                                                value={row.Vouchers_descartados}
                                            />
                                            <DetailField
                                                label="Analista"
                                                value={row.Analista}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </Fragment>
                    );
                })}

                {rows.length === 0 && (
                    <TableRow>
                        <TableCell
                            colSpan={DETAIL_COLSPAN}
                            className="py-6 text-center bo-label"
                        >
                            No hay filas en la propuesta.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
