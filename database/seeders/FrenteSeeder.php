<?php

namespace Database\Seeders;

use App\Models\Frente;
use Illuminate\Database\Seeder;

class FrenteSeeder extends Seeder
{
    /**
     * Seed the frentes/iniciativas from the previously hardcoded FRENTES constant in innovacion.tsx.
     */
    public function run(): void
    {
        foreach ($this->frentes() as $frenteIndex => $frente) {
            $model = Frente::create([
                'area' => $frente['area'],
                'owner' => $frente['owner'],
                'sort_order' => $frenteIndex,
            ]);

            foreach ($frente['items'] as $itemIndex => $item) {
                $model->iniciativas()->create([
                    'n' => $item['n'],
                    'badge' => $item['badge'],
                    'cls' => $item['cls'],
                    'desc' => $item['desc'],
                    'url' => $item['docHref'] ?? null,
                    'sort_order' => $itemIndex,
                ]);
            }
        }
    }

    /**
     * @return array<int, array{area: string, owner: string, items: array<int, array{n: string, badge: string, cls: string, desc: string, docHref?: string}>}>
     */
    private function frentes(): array
    {
        return [
            [
                'area' => 'Administrativo · Cuentas a pagar',
                'owner' => 'V. Homez · Y. Juárez',
                'items' => [
                    [
                        'n' => 'Bot de carga en TourPlan',
                        'badge' => 'Producción',
                        'cls' => 'prod',
                        'desc' => 'Procesó 600.000 líneas históricas: genera invoices y cheques con el costo real cargado contra cada línea.',
                    ],
                    [
                        'n' => 'Carga diaria de tipos de cambio en TourPlan',
                        'badge' => 'Producción',
                        'cls' => 'prod',
                        'desc' => 'Actualiza automáticamente las cotizaciones del día en TourPlan para que las cargas y cotizaciones usen el tipo de cambio correcto.',
                        'docHref' => '/documentos/tourplan-fx-bot-funcionalidad.md',
                    ],
                    [
                        'n' => 'Conciliador de pagos duplicados',
                        'badge' => 'Desarrollo',
                        'cls' => 'dev',
                        'desc' => 'Alerta REVISAR / CON FACTURAS PREVIAS / NUEVA por proveedor + file, antes de generar la OP.',
                    ],
                    [
                        'n' => 'Chat IA de documentación',
                        'badge' => 'Análisis',
                        'cls' => 'ana',
                        'desc' => 'Asistente que responde sobre procesos de CxP a partir de la documentación. Pendiente de aprobación.',
                    ],
                    [
                        'n' => 'Comprobantes USD · Banco→Drive',
                        'badge' => 'Sin iniciar',
                        'cls' => 'cero',
                        'desc' => 'Captura automática de comprobantes en dólares del banco a Drive. Pendiente de aprobación.',
                    ],
                    [
                        'n' => 'Sistematización de pagos a guías',
                        'badge' => 'Sin iniciar',
                        'cls' => 'cero',
                        'desc' => 'Anticipos, rendición de gastos y honorarios. Requiere documentar el proceso completo.',
                    ],
                    [
                        'n' => 'Panel de Rendición de Gastos',
                        'badge' => 'En prueba',
                        'cls' => 'test',
                        'desc' => 'Panel guiado que reemplaza la carga manual del Excel oficial de rendición de gastos: se completa paso a paso y descarga el mismo Excel ya completo, con fórmulas y validaciones intactas, listo para Tesorería. Cubre ARS y moneda extranjera, hasta 60 comprobantes.',
                        'docHref' => '/adm/rendicion-gastos',
                    ],
                ],
            ],
            [
                'area' => 'Contrataciones · Base de datos',
                'owner' => 'M. Zanone',
                'items' => [
                    [
                        'n' => 'Revalorización de tarifas (PCM)',
                        'badge' => 'En TEST',
                        'cls' => 'test',
                        'desc' => 'Revaloriza el PCM cuando cambia un componente: modifica el servicio madre o crea temporada. Corre desde un prompt.',
                    ],
                    [
                        'n' => 'Descarga de reportes TP NX',
                        'badge' => 'Funciona',
                        'cls' => 'live',
                        'desc' => 'Bajada automática de reportes de Operations (Tour Summary y otros). Patrón replicable.',
                    ],
                ],
            ],
            [
                'area' => 'Conciliaciones bancarias',
                'owner' => 'Tesorería + Contabilidad',
                'items' => [
                    [
                        'n' => 'Conciliación bancaria con IA + bot',
                        'badge' => 'En curso',
                        'cls' => 'curso',
                        'desc' => 'Iniciativa de Administración. En exploración — conviene coordinar para no solaparse con CxP.',
                    ],
                ],
            ],
            [
                'area' => 'Uso propio · Productividad',
                'owner' => 'V. Homez',
                'items' => [
                    [
                        'n' => 'Reporte semanal + dashboard',
                        'badge' => 'Desarrollo',
                        'cls' => 'dev',
                        'desc' => 'Banco de pruebas de lo mismo que se baja al resto: aplicar primero en uno lo que después se enseña.',
                    ],
                    [
                        'n' => 'Pipeline reuniones → Notion',
                        'badge' => 'Análisis',
                        'cls' => 'ana',
                        'desc' => 'De la reunión a notas estructuradas en Notion, listas para consultar.',
                    ],
                    [
                        'n' => 'Asistente de correo · digest 9am',
                        'badge' => 'Análisis',
                        'cls' => 'ana',
                        'desc' => 'Resumen diario del correo entregado a las 9am.',
                    ],
                ],
            ],
            [
                'area' => 'Contabilidad · Cierre mensual',
                'owner' => 'E. Quintana · N. Basualdo',
                'items' => [
                    [
                        'n' => 'Pre-Balance de Módulos (Tango)',
                        'badge' => 'En prueba',
                        'cls' => 'test',
                        'desc' => 'Se le arrastran los 4 reportes de Tango y devuelve el Excel armado con 15 controles: pegado de listados, fórmulas EXTRAE, saldo neto debe menos haber, tablas dinámicas por cuenta, validación de que cada módulo dé cero, BUSCARV contra el plan de cuentas y detección de cuentas nuevas.',
                        'docHref' => '/documentos/prebalance-modulos.docx',
                    ],
                ],
            ],
        ];
    }
}
