<?php

namespace Database\Seeders;

use App\Models\SectorGroup;
use Illuminate\Database\Seeder;

class SectorLinksSeeder extends Seeder
{
    /**
     * Seed the sector groups/items from the previously hardcoded portal-sections-data.ts content.
     */
    public function run(): void
    {
        foreach ($this->sectors() as $sector => $groups) {
            foreach ($groups as $groupIndex => $group) {
                $sectorGroup = SectorGroup::create([
                    'sector' => $sector,
                    'title' => $group['title'],
                    'sort_order' => $groupIndex,
                ]);

                foreach ($group['items'] as $itemIndex => $item) {
                    $sectorGroup->items()->create([
                        'label' => $item['t'],
                        'url' => $item['h'] ?? null,
                        'badge' => $item['badge'] ?? null,
                        'keywords' => $item['keywords'] ?? null,
                        'sort_order' => $itemIndex,
                    ]);
                }
            }
        }
    }

    /**
     * @return array<string, array<int, array{title: string, items: array<int, array{t: string, h?: string, badge?: string, keywords?: string}>}>>
     */
    private function sectors(): array
    {
        $l = fn (string $t, string $h) => ['t' => $t, 'h' => $h];
        $t = fn (string $t) => ['t' => $t];

        return [
            'rrhh' => [
                ['title' => 'Empleado', 'items' => [
                    $l('Formulario de altas de personal', 'https://drive.google.com/drive/u/0/folders/1qCarwAsJhCp3noSeNa9UJOZktMASLZAl'),
                    $l('Carta vacaciones Eurotur', 'https://drive.google.com/drive/u/0/folders/1ESdsqm5G3rIaFKVWpRSXuvKel6hwAOpR'),
                    $l('Carta vacaciones Travel Designers', 'https://drive.google.com/drive/u/0/folders/1ESdsqm5G3rIaFKVWpRSXuvKel6hwAOpR'),
                    $l('Email, grupos y teléfonos', 'https://docs.google.com/spreadsheets/d/1o5Gsm8oSGapcLPGLmHGpmAZwyK9_49VFLQ_e6tqz_5o/edit'),
                    $l('DDJJ de Domicilio Eurotur', 'https://drive.google.com/drive/u/1/folders/1rAVXN-F3tORsSqACPT3lWrZXr0eq906o'),
                    $l('DDJJ de Domicilio Travel Designers', 'https://drive.google.com/drive/u/1/folders/1rAVXN-F3tORsSqACPT3lWrZXr0eq906o'),
                ]],
                ['title' => 'Descripciones de puestos', 'items' => [
                    $l('Operaciones', 'https://drive.google.com/drive/u/0/folders/1pL7ZsiVWP4kl3rFThpNmblBgwcDbJ5t8'),
                    $l('Administración', 'https://drive.google.com/drive/folders/195i-maUiLiBFPPuzb__9LMd77hjmZlDS'),
                    $l('Contrataciones', 'https://drive.google.com/drive/folders/1ogdPFJRGxqAxPSFiVzSYOzNE4GFAeNCJ'),
                ]],
                ['title' => 'Políticas de personal', 'items' => [
                    $l('Política de personal', 'https://drive.google.com/drive/u/0/folders/1egYGkgq1Yc5XPMZwLZc952K5Vi8hHdMi'),
                    $l('Rendición de gastos de internet', 'https://docs.google.com/forms/d/e/1FAIpQLSdNjkgDveNTy3jp8dx1y43mrpgRH688NRSuoqve4Cha2143HQ/viewform'),
                ]],
                ['title' => 'Feriados', 'items' => [
                    $l('Feriados nacionales 2026', 'https://www.argentina.gob.ar/jefatura/feriados-nacionales-2026'),
                    $l('Actividad oficinas BUE-FTE-USH 2026', 'https://drive.google.com/drive/u/0/folders/1Ewpl-6o3RkYQh9rMSZE-Ern2SYQw6o6E'),
                ]],
                ['title' => 'Cronogramas', 'items' => [
                    $l('Cronograma 24 y 31·12·25', 'https://drive.google.com/drive/u/0/folders/1-f5Ymcn9n_zTClSXgWxEMkFLP_wlv0GX'),
                ]],
                ['title' => 'Organigrama', 'items' => [
                    $l('Organigrama Eurotur', 'https://drive.google.com/drive/u/0/folders/1YBH-WESU1sBqR1v6VjPDlpH0fwtTAfcV'),
                ]],
                ['title' => 'Datos ART', 'items' => [
                    $l('Eurotur S.A.', 'https://drive.google.com/drive/folders/1M0bvz0j36Zvbc2bJrKK_XwlxJ-coJF0z'),
                    $l('Travel Designers S.A.', 'https://drive.google.com/drive/folders/1M0bvz0j36Zvbc2bJrKK_XwlxJ-coJF0z'),
                ]],
                ['title' => 'Liquidación de sueldo', 'items' => [
                    $l('Modelo de recibo (Excel)', 'https://docs.google.com/spreadsheets/d/1RLN0FVoN9zeE7CF7pCheeOdPcPNtZMjC/edit'),
                    $l('Presentación', 'https://drive.google.com/drive/u/0/folders/1gkSTI2Lv-8Sa1YRQEMxG7ccQTfBNCrf3'),
                    $l('Escalas CCT 547/08 · 08/2025', 'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO'),
                    $l('Escalas CCT 547/08 · 12/2025', 'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO'),
                    $l('Paritaria FAECYS-FAEVYT · 05/2026', 'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO'),
                ]],
            ],

            'adm' => [
                ['title' => 'Aspectos legales', 'items' => [
                    $l('DDJJ recepción facturas T', 'https://drive.google.com/drive/folders/1Y8w4rLzRTM1Kx7U9eL58fu_4SWaOMmvM'),
                    $l('Habilitación municipal', 'https://drive.google.com/drive/folders/1Y8w4rLzRTM1Kx7U9eL58fu_4SWaOMmvM'),
                    $l('Min. de Turismo — habilitaciones', 'https://drive.google.com/drive/folders/1xhuSF_B2r-b1beqoe20M1QtS9N4WWAre'),
                    $l('Acta designación directorio (clave)', 'https://drive.google.com/drive/folders/1UYkxuwBIDqJN0LoObosAYk_PaU5OY9la'),
                    $l('Estatutos (clave)', 'https://drive.google.com/drive/folders/1i5uWwC6d_LTHRvQr59q9vviM5S8vvVJJ'),
                    $l('Poder general de admin. MZ (clave)', 'https://drive.google.com/drive/folders/1Tc3o59yODKPysQ3MKkMt-MZdinjDc90H'),
                ]],
                ['title' => 'Aspectos impositivos', 'items' => [
                    $l('Constancia CUIT Eurotur S.A.', 'https://drive.google.com/drive/folders/1eeFcxPvagetiTzxtFxunibo9Kbdth1hz'),
                    $l('Constancia CUIT Travel Designers S.A.', 'https://drive.google.com/drive/folders/1eeFcxPvagetiTzxtFxunibo9Kbdth1hz'),
                    $l('Ingresos brutos Eurotur S.A.', 'https://drive.google.com/drive/folders/1RRVZ0g8Q6TPaHUEN-EMCqnobP9G_XbFD'),
                    $l('Ingresos brutos Travel Designers S.A.', 'https://drive.google.com/drive/folders/1RRVZ0g8Q6TPaHUEN-EMCqnobP9G_XbFD'),
                    $l('Certificados MiPyme', 'https://drive.google.com/drive/u/0/folders/1LzoEK6buqxEMiW9IlBjnr3NyVh53qz1_'),
                ]],
                ['title' => 'Datos bancarios', 'items' => [
                    $l('Ciudad', 'https://drive.google.com/drive/folders/16HCS0kUKafBfQVhMceKNiAY4VPn2WMuk'),
                    $l('Patagonia', 'https://drive.google.com/drive/folders/18AWK4aRdlWr3GQ2J0c0OpQlVR52L53Qt'),
                    $l('Exterior', 'https://drive.google.com/drive/folders/18NfZslQ_oZYfptHRTvquEbn8PhTfHenk'),
                    $l('Transferencia al exterior', 'https://docs.google.com/spreadsheets/d/1UCcDtwFNdxMfA5JZtipjStmyiXTCzmqk/edit'),
                ]],
                ['title' => 'Pólizas de seguros', 'items' => [
                    $l('Eurotur S.A.', 'https://drive.google.com/drive/folders/14UM1ur_nE_9ctehuYVNlzhmjXuLVFAdD'),
                    $l('Travel Designers S.A.', 'https://drive.google.com/drive/folders/1YDItsG3qyEFY2Sqh_VBqLC3kKRJh-s5x'),
                ]],
                ['title' => 'Cuentas a pagar', 'items' => [
                    $t('Solicitud pago Comex — form en página'),
                    $l('DDJJ Reintegro IVA (Factura T)', 'https://drive.google.com/drive/folders/1_czEemImOk5cn2I2td4L6FelKAKCrfOW'),
                    $l('Formulario rendición de gastos', 'https://drive.google.com/drive/u/0/folders/1rRgOCZ8QBBin6Qgjmnxb-cGbwJhm_5I_'),
                    $l('Affidavit Eurotur LLC', 'https://docs.google.com/document/d/1k6qnapxbrIn0AURjEyQZKYNjRi2w8ggh/edit'),
                ]],
                ['title' => 'Balances (clave)', 'items' => [
                    $l('Eurotur S.A.', 'https://drive.google.com/drive/folders/1nWVLn72ImqaS-hw--z9tnKsDdj0ST2_o'),
                    $l('Travel Designers S.A.', 'https://drive.google.com/drive/folders/1wrrk3uSWgTZPuC5AvlQOvY-Nin6NW9Ir'),
                ]],
                ['title' => 'Instructivos', 'items' => [
                    $l('Cierre de módulo mensual', 'https://drive.google.com/drive/folders/1mWxtqI1mgSq6gx2b7IHbsA4BNek9zZSD'),
                    $l('Pre-Balance de Módulos — cómo se usa', '/documentos/prebalance-modulos.docx'),
                ]],
                ['title' => 'Contabilidad · Cierre mensual', 'items' => [
                    [
                        't' => 'Pre-Balance de Módulos — herramienta',
                        'h' => '/adm/prebalance',
                        'badge' => 'En prueba — Contabilidad',
                        'keywords' => 'prebalance, pre-balance, balance de módulos, cierre contable, Tango, sumas y saldos',
                    ],
                    $l('Pre-Balance de Módulos — documentación', '/documentos/prebalance-modulos.docx'),
                ]],
            ],

            'contrataciones' => [
                ['title' => 'Servicios', 'items' => [
                    $l('Transportistas (BUE·FTE·USH·SLA)', 'https://drive.google.com/drive/folders/1di7_cCAdfVbU3SE3gI-t8WuEgDq7IfsM'),
                    $l('Bases de vehículos', 'https://docs.google.com/spreadsheets/d/1zI0Y06ekIEJJ5-UoxLzAYDE3hQhMqN6iD1xKal9GXhM/edit'),
                    $l('Rent-a-Car: tarifarios clientes', 'https://drive.google.com/drive/folders/1Bg0iCyfn5q1Z46ZMYyQ30QCXKUm4bI6g'),
                ]],
                ['title' => 'Hotelería', 'items' => [
                    $l('Comparativos de hoteles', 'https://drive.google.com/drive/folders/1y2y-fAsmKVlgPtTGgXMV3urxDQU7R6Hy'),
                    $l('Hoteles recomendados', 'https://docs.google.com/spreadsheets/d/1kwqVIy2-rw2zR9h7JUkDaIlPHU6b0w9ZcwNX5Du_gQQ/edit'),
                    $l('Hoteles vinculados a Hyperguest', 'https://docs.google.com/spreadsheets/d/19g-8wGzvnwT45l_Ga3SEJyBMazhSlryf5uClOzpHKgY/edit'),
                ]],
                ['title' => 'Interno', 'items' => [
                    $l('Responsables — distribución interna', 'https://docs.google.com/spreadsheets/d/1kQM_8I9p0coDhh8UH8bjD0OuDlTqiOPX7G7brSPcaVo/edit'),
                ]],
                ['title' => 'Sucursales', 'items' => [
                    $l('Interagencias (USH)', 'https://drive.google.com/drive/folders/1rQeCVBCjZPHu1DEr27qPuhRqBUEYlftI'),
                    $l('Interagencias (FTE)', 'https://drive.google.com/drive/folders/1xdUx_IJasHrEGlnRDW7xoIC8i7I8_3RA'),
                    $l('Interagencias (SLA) y SIBs', 'https://docs.google.com/spreadsheets/d/1iSELrVdPylVbH0Fz-NfRjjuGPhWeQ6LiLQMOQC3UUTU/edit'),
                ]],
                ['title' => 'Alta de proveedor', 'items' => [
                    $l('Servicios / Hoteles', 'https://forms.gle/TbejmP67EnMZMuus9'),
                    $l('Transportista', 'https://forms.gle/61BbkyprUocRgLAh8'),
                    $l('Guías', 'https://forms.gle/yVsXMkYER3g7bmdx5'),
                ]],
                ['title' => 'Procedimientos', 'items' => [
                    $l('Procedimientos', 'https://drive.google.com/drive/folders/1DtU-HYvAm4aijJ7En1wh-gSOvG9lnSAT'),
                ]],
            ],

            'operaciones' => [
                ['title' => 'Operaciones', 'items' => [
                    $l('Instrucciones & procedimientos', 'https://drive.google.com/drive/u/0/folders/1SFypymYk36FFEls5jtPui-RV63vlcmav'),
                    $l('FITs', 'https://drive.google.com/drive/u/0/folders/1GaWceN_6C8KdHxcXZbdQLWEE4NIla8bi'),
                    $l('Grupos', 'https://drive.google.com/drive/u/0/folders/1r1brPFqLV9imltVtzXZNrVZi5u09YMcY'),
                    $l('Aéreos', 'https://drive.google.com/drive/u/0/folders/1YyXxhXl5xwWl-w4ZB-XvDh-uwrKtGBY7'),
                    $l('Contingencias (histórico)', 'https://drive.google.com/drive/folders/1UCFuMzJu4cWBSZVoOt_U8tDS8ekPZTZl'),
                ]],
                ['title' => 'Grupos — detalle', 'items' => [
                    $l('Información varia', 'https://drive.google.com/drive/u/0/folders/14xXTAVgCLda9Hlo9MRWSSb-PK54kdT1z'),
                    $l('Instructivos', 'https://drive.google.com/drive/u/0/folders/1HvnUL76LW1GVAZKUa-lM4QCWY7l8yrIO'),
                    $l('Cotización · parámetros', 'https://drive.google.com/drive/u/0/folders/1r1v1glRhprE5sP0FPN2hgX3dDzhB4xQ2'),
                ]],
                ['title' => 'Buenos Aires / equipos', 'items' => [
                    $l('Sucursales', 'https://drive.google.com/drive/folders/1hjiMnQvwWiGKuGxs4Y_n1dbtcf7ZrANY'),
                    $l('Equipos', 'https://drive.google.com/drive/u/0/folders/1J6wS2wl6sD6CFlIup2Egco2D1h4KyJ3Y'),
                    $l('Planillas operativas', 'https://drive.google.com/drive/u/0/folders/1SJpvSK6w5zm1p0D-wxLjgeyBLyeXmd-H'),
                    $l('Links tarifarios', 'https://drive.google.com/drive/u/0/folders/1yJcAQLCXjJ2rbDGcgFlP9wzJY-hMQIsx'),
                    $l('Bloqueos', 'https://drive.google.com/drive/u/0/folders/1CCRGB60vvTK-Dlwy4LBvztHSQPSIZTRQ'),
                    $l('Cierres', 'https://drive.google.com/drive/u/0/folders/1HeE9AIjIbTwXwj3b0F_cPaCAeQyGIrVM'),
                ]],
                ['title' => 'Instructivos · BUE', 'items' => [
                    $l('Procedimientos', 'https://drive.google.com/drive/u/0/folders/1Au8_BCWEvUxtMHW9_ep3ZIeR9GVfH8ub'),
                    $l('Guías', 'https://drive.google.com/drive/u/0/folders/1l86WWld2cLW4YPcO8VQGD8qmNzJ934Gj'),
                    $l('Transporte', 'https://drive.google.com/drive/u/0/folders/141CZ5N2bao7LXWNG4rSxG4pd6lEO2pyI'),
                    $l('Seguridad', 'https://drive.google.com/drive/u/0/folders/1ShCxFq8mQOA8MIXSiJ2_gnHK5ghv-qH0'),
                ]],
                ['title' => 'Instructivos · sucursales', 'items' => [
                    $l('Procedimientos', 'https://drive.google.com/drive/u/0/folders/1p51-4Ha2UFvzdT1iiCFVQ6GBkmfFFfWo'),
                    $l('Vencimientos oficinas y flota TD', 'https://drive.google.com/drive/u/0/folders/1LlCZg9lGNO1XOXBqkpfRikumPWracUw2'),
                ]],
                ['title' => 'Ushuaia', 'items' => [
                    $l('Guías', 'https://drive.google.com/drive/u/0/folders/1sUJFCPqkXgYa3eKYiXOBZ44Inn0G9ef9'),
                    $l('Transporte', 'https://drive.google.com/drive/u/0/folders/1wP-Kfz3w_GGyuxaaUMRrCTZiKOusyzmp'),
                    $l('Restaurantes (uso interno)', 'https://sites.google.com/eurotur.tur.ar/restaurantesushuaia'),
                ]],
                ['title' => 'Calafate', 'items' => [
                    $l('Guías', 'https://drive.google.com/drive/u/0/folders/1y8wOktFPvV61xhc2vVoB-FE5673mIB48'),
                    $l('Transporte', 'https://drive.google.com/drive/folders/1XFfJDVP-OD7PsYTffVm-lbwz6ZkKD0pK'),
                    $l('Restaurantes (uso interno)', 'https://sites.google.com/eurotur.tur.ar/restaurantescalafate/inicio'),
                ]],
                ['title' => 'Salta', 'items' => [
                    $l('Apertura', 'https://drive.google.com/drive/u/0/folders/1Ked6Y5h1L3oFZiTV7Sk0ichkUDRrqHTF'),
                    $t('Guías / Transporte / Restaurantes — en preparación'),
                ]],
            ],

            'producto' => [
                ['title' => 'Herramientas', 'items' => [
                    $l('Políticas de menores', 'https://drive.google.com/drive/u/0/folders/1HwIbaVKHd4L_GrjnopcKAMv7k4hJUgpG'),
                    $l('Horario de excursiones', 'https://drive.google.com/drive/u/0/folders/18Im6qWJZwrZlbQBHXOot8zQ0U1lqE8fB'),
                    $l('Fichas técnicas Tango', 'https://drive.google.com/drive/u/0/folders/1_TRFlwGeN_p1rwYhIUVflPkjPYxPTI8k'),
                    $l('Ficha hoteles', 'https://drive.google.com/drive/u/0/folders/1qqZ4KWzg_mwqO0oXpYIgstbBZjSvlbGe'),
                    $l('Family Plan', 'https://drive.google.com/drive/u/0/folders/1O83oWF5hO62efF1UGLAypLXbjCCJgNdj'),
                    $l('Comparativas', 'https://drive.google.com/drive/u/0/folders/16EtqTxkRcfGtSQX30un4-N0NGrb4j6Os'),
                    $l('Base vehículos', 'https://drive.google.com/drive/u/0/folders/1Lwp2HRaRNtOt64nonTcuWkWIUi7o4_-w'),
                    $l('Tours de Buenos Aires', 'https://drive.google.com/drive/u/0/folders/1jeBQOfsRgpcgwsAv1NccCR4I5-ovPxpN'),
                ]],
                ['title' => 'Reportes', 'items' => [
                    $l('Reporte', 'https://docs.google.com/document/d/1PpJk07lmw7PGilul4zqlS54ZEnSGC-zV/edit'),
                    $l('Productos', 'https://drive.google.com/drive/u/0/folders/1sgazGsnLQj5m9AabP-uZ5UPeC2ICeNH1'),
                    $l('Sites hoteles', 'https://drive.google.com/drive/u/0/folders/1-4ICNSD-bInkaTiKraxhwQzXRHynX3zm'),
                ]],
                ['title' => 'Internas', 'items' => [
                    $l('Procedimientos internos', 'https://drive.google.com/drive/u/0/folders/14yI4_JqsRObmD9QBf6pxBisPM9J6G6mK'),
                ]],
                ['title' => 'Novedades', 'items' => [
                    $l('Novedades productos', 'https://drive.google.com/drive/u/0/folders/1HGEFn6CxJKzPh2JMZXK07v1-vc5ljE0h'),
                ]],
                ['title' => 'Fotos', 'items' => [
                    $l('Hoteles', 'https://drive.google.com/drive/u/0/folders/1vaFB4CVKaLSN1MLPl5Cdnu2tWh3dAwyx'),
                    $l('Atractivos', 'https://drive.google.com/drive/u/0/folders/1ZUd_jV62Q078V3Xjso7e3bCB4wVEjDys'),
                    $t('Presentaciones — en preparación'),
                ]],
            ],

            'customercare' => [
                ['title' => 'Reportes', 'items' => [
                    $l('Reporte final de temporadas', 'https://drive.google.com/drive/folders/1hnGCFM2a69of_6LBE9wlsZrKxOsNnitD'),
                ]],
                ['title' => 'Estandarización de servicios', 'items' => [
                    $l('Estandarización Eurotur 2025', 'https://drive.google.com/drive/folders/1tagtLwhKKX5CuaWb4vY7SbN1uCZpxTUl'),
                    $l('Mensajes estandarizados BUE·FTE·USH', 'https://docs.google.com/document/d/1FK3zEhXnd8kmU6T6785WFKuGw3M9zxTN/edit'),
                ]],
                ['title' => 'Nota a los pasajeros', 'items' => [
                    $l('Español', 'https://drive.google.com/drive/folders/1IHCup3ssmm2GkEVeRVTwach-jzQD4t49'),
                    $l('Inglés', 'https://drive.google.com/drive/folders/1YI6h6zGjjFLQJ_VeDc8pGtXhgb5NDiaG'),
                    $l('Francés', 'https://drive.google.com/drive/folders/12dSQnvvjtzaBLtxZ4iaFk_dat5_ask92'),
                    $l('Italiano', 'https://drive.google.com/drive/folders/1WJH6-Kh0TvxLkUg4TJiFLKTEDQBTnFQq'),
                ]],
                ['title' => 'Procedimientos', 'items' => [
                    $l('Emisión de documentación en TP', 'https://drive.google.com/drive/folders/1k-DepkqG3gBHehkYCYlkYz0fEZpMhErp'),
                    $l('Servicio de Concierge', 'https://drive.google.com/drive/folders/1PVtgEdUIYjojH_NGDWqSel_f_nvtSX3Z'),
                ]],
            ],

            'sales' => [
                ['title' => 'Clientes', 'items' => [
                    $l('Clientes', 'https://drive.google.com/drive/folders/1vxWJN6PJMDQIq6Ayk1XDRlL-b5ntjYWw'),
                    $t('Sección en ampliación'),
                ]],
            ],

            'traveldesigners' => [
                ['title' => 'Información', 'items' => [
                    $l('Manual de conductores/as', 'https://drive.google.com/drive/u/0/folders/166lJNjbeaRrE272XPPRCr-ollXUqeVsc'),
                    $l('Manual de convivencia', 'https://drive.google.com/drive/u/0/folders/16BCxu_MZyx5WA_3vjJA6dNk2xkpXw3O1'),
                    $l('Simulacro de recibo de haberes', 'https://drive.google.com/drive/u/0/folders/1ixZQMHj3CymaSnMuIQKAjzTdu7gcHLJU'),
                ]],
                ['title' => 'Dirección', 'items' => [
                    $t('Av. Montes de Oca 2238, CABA'),
                ]],
            ],

            'it' => [
                ['title' => 'Ticketera & soporte', 'items' => [
                    $l('Ticketera', 'https://docs.google.com/forms/d/e/1FAIpQLSeyq0O-jjq9FRdLqdL8NeOuDogy0VrRfvspfBXU7-3_AO64rA/viewform'),
                    $l('Gestión soporte interno', 'https://drive.google.com/drive/folders/11VgSUUrIjarUZW3OfcCR-huLJsWVehY0'),
                    $l('Informe de backups (clave)', 'https://drive.google.com/drive/folders/1KH4U7tGSAiiTtSVdgdCsACXNGh-ijnfl'),
                ]],
                ['title' => 'Seguridad & manuales', 'items' => [
                    $l('Ciberataques', 'https://docs.google.com/presentation/d/1YK6CTvN4Fowmuvt0ai7XAU73NM-7zhMb/edit'),
                    $l('Tango / Delta (Axoft)', 'https://ayudas.axoft.com/21ar/documentos/operacion/'),
                    $t('Proveedores: Tec 5 · IPLAN · METROTEL'),
                ]],
                ['title' => 'Sistemas', 'items' => [
                    $l('Tourplan', 'https://drive.google.com/drive/folders/1y7JY1XX1Cu1ydwA-E_LY1vYjoI9IFmpt'),
                    $l('Tourplan — instructivos', 'https://drive.google.com/drive/folders/1xK4pC-HiQ3nFXaEPIJ0zwhy2WoWFrJ0s'),
                    $l('Sabre', 'https://drive.google.com/drive/folders/1P4X3YKHLt5ZST6YokWcsJgMAOMpEoT9J'),
                    $l('Sabre — descargar', 'https://www.sabre.com/products/suites/customer-touchpoints/sabre-red-360/'),
                    $l('IDB / BOT', 'https://indatabiz.com/soporte/doc/entendiendo-idb-glider-y-su-principio-de-funcionamiento/'),
                ]],
                ['title' => 'Telefonía & internos', 'items' => [
                    $l('Zoiper — presentación', 'https://docs.google.com/presentation/d/1XuEdYtfSYAuZGh0uw20nxzQukcy71tvWhMAHnvxvNq4/edit'),
                    $l('Zoiper PC', 'https://docs.google.com/document/d/1Ai1EvGJ75opFN7n_XjJswqOoUHYDGTTF/edit'),
                    $l('Zoiper celular', 'https://drive.google.com/drive/u/0/folders/1sq_P9iZJmIYhPwLdmjPWGryNCKk9NsQr'),
                    $l('Internos Eurotur', 'https://docs.google.com/spreadsheets/d/17_yPlbkFWjTYLPNz7TCRf_pXSp_XIXOy/edit'),
                    $l('Plano de internos', 'https://drive.google.com/drive/u/0/folders/1UV8XKwPEm_U470vl-58MUVL-J1f-Dj6j'),
                ]],
                ['title' => 'Google Meet & Gmail', 'items' => [
                    $l('Audio notebook para Meet', 'https://docs.google.com/document/d/1pasl8bOXJTSpv447ueah1m7KB7Ro-a2v/edit'),
                    $l('Fondo en reuniones Meet', 'https://drive.google.com/drive/u/0/folders/1T11gNO9I45pHtctv3C-vIMS0nnaP5cV0'),
                    $l('Delegación de permisos en Gmail', 'https://drive.google.com/drive/u/0/folders/1D0fQuSnomiZfXVGfiiMuvK6eWl0yYdNg'),
                    $l('Complementos Excel (Disco T)', 'https://drive.google.com/drive/folders/1TtmqBMJDBpgYtnrihCJNkOrvp694ybD9'),
                ]],
                ['title' => 'Equipos & acceso remoto', 'items' => [
                    $l('Notebook — instructivo', 'https://drive.google.com/drive/folders/10lZVU9urVZfJ9aXiSau9H3d-rZn8Kyc4'),
                    $l('VPN Forticlient / IPSec', 'https://drive.google.com/drive/folders/1IcY-SmWA-ZfhzMernOiXl05mGJCcSNU7'),
                    $l('Guacamole (fuera de Argentina)', 'https://remoto.eurotur.tur.ar/'),
                ]],
            ],

            'responsables' => [
                ['title' => 'Institucional', 'items' => [$t('De Bin, Aldo')]],
                ['title' => 'RRHH', 'items' => [$t('Velázquez, Romina')]],
                ['title' => 'Guía telefónica', 'items' => [$t('Velázquez, Romina')]],
                ['title' => 'Impuestos & Legales', 'items' => [$t('Quintana, Elsa')]],
                ['title' => 'Datos bancarios y pólizas', 'items' => [$t('Agüero, Leonela')]],
                ['title' => 'Cuentas a pagar', 'items' => [$t('Flores, María Beatriz')]],
                ['title' => 'Operaciones', 'items' => [$t('Juliano, María Valeria')]],
                ['title' => 'Contrataciones', 'items' => [$t('Garrigo, Mariana · Dis, Paula')]],
                ['title' => 'Producto', 'items' => [$t('Carrizo, C. · Aleu, M. · Carbajo, A.')]],
                ['title' => 'Comercial', 'items' => [$t('Zanone · Meyoyan · Carrizo · Lezcano · Clement · Bonserio')]],
                ['title' => 'IT', 'items' => [$t('Fuentes, Yenedier')]],
                ['title' => 'Cotización Dólar', 'items' => [$t('Fuentes, Yenedier')]],
                ['title' => 'Contabilidad · Pre-Balance', 'items' => [$t('Quintana, Elsa')]],
            ],
        ];
    }
}
