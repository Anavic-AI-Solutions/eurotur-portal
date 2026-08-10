import type {
    SectorGroup,
    SectorIndexData,
} from '@/components/portal/sector-index';

function L(t: string, h: string): { t: string; h: string } {
    return { t, h };
}

function T(t: string): { t: string } {
    return { t };
}

const RRHH_GROUPS: SectorGroup[] = [
    {
        title: 'Empleado',
        items: [
            L(
                'Formulario de altas de personal',
                'https://drive.google.com/drive/u/0/folders/1qCarwAsJhCp3noSeNa9UJOZktMASLZAl',
            ),
            L(
                'Carta vacaciones Eurotur',
                'https://drive.google.com/drive/u/0/folders/1ESdsqm5G3rIaFKVWpRSXuvKel6hwAOpR',
            ),
            L(
                'Carta vacaciones Travel Designers',
                'https://drive.google.com/drive/u/0/folders/1ESdsqm5G3rIaFKVWpRSXuvKel6hwAOpR',
            ),
            L(
                'Email, grupos y teléfonos',
                'https://docs.google.com/spreadsheets/d/1o5Gsm8oSGapcLPGLmHGpmAZwyK9_49VFLQ_e6tqz_5o/edit',
            ),
            L(
                'DDJJ de Domicilio Eurotur',
                'https://drive.google.com/drive/u/1/folders/1rAVXN-F3tORsSqACPT3lWrZXr0eq906o',
            ),
            L(
                'DDJJ de Domicilio Travel Designers',
                'https://drive.google.com/drive/u/1/folders/1rAVXN-F3tORsSqACPT3lWrZXr0eq906o',
            ),
        ],
    },
    {
        title: 'Descripciones de puestos',
        items: [
            L(
                'Operaciones',
                'https://drive.google.com/drive/u/0/folders/1pL7ZsiVWP4kl3rFThpNmblBgwcDbJ5t8',
            ),
            L(
                'Administración',
                'https://drive.google.com/drive/folders/195i-maUiLiBFPPuzb__9LMd77hjmZlDS',
            ),
            L(
                'Contrataciones',
                'https://drive.google.com/drive/folders/1ogdPFJRGxqAxPSFiVzSYOzNE4GFAeNCJ',
            ),
        ],
    },
    {
        title: 'Políticas de personal',
        items: [
            L(
                'Política de personal',
                'https://drive.google.com/drive/u/0/folders/1egYGkgq1Yc5XPMZwLZc952K5Vi8hHdMi',
            ),
            L(
                'Rendición de gastos de internet',
                'https://docs.google.com/forms/d/e/1FAIpQLSdNjkgDveNTy3jp8dx1y43mrpgRH688NRSuoqve4Cha2143HQ/viewform',
            ),
        ],
    },
    {
        title: 'Feriados',
        items: [
            L(
                'Feriados nacionales 2026',
                'https://www.argentina.gob.ar/jefatura/feriados-nacionales-2026',
            ),
            L(
                'Actividad oficinas BUE-FTE-USH 2026',
                'https://drive.google.com/drive/u/0/folders/1Ewpl-6o3RkYQh9rMSZE-Ern2SYQw6o6E',
            ),
        ],
    },
    {
        title: 'Cronogramas',
        items: [
            L(
                'Cronograma 24 y 31·12·25',
                'https://drive.google.com/drive/u/0/folders/1-f5Ymcn9n_zTClSXgWxEMkFLP_wlv0GX',
            ),
        ],
    },
    {
        title: 'Organigrama',
        items: [
            L(
                'Organigrama Eurotur',
                'https://drive.google.com/drive/u/0/folders/1YBH-WESU1sBqR1v6VjPDlpH0fwtTAfcV',
            ),
        ],
    },
    {
        title: 'Datos ART',
        items: [
            L(
                'Eurotur S.A.',
                'https://drive.google.com/drive/folders/1M0bvz0j36Zvbc2bJrKK_XwlxJ-coJF0z',
            ),
            L(
                'Travel Designers S.A.',
                'https://drive.google.com/drive/folders/1M0bvz0j36Zvbc2bJrKK_XwlxJ-coJF0z',
            ),
        ],
    },
    {
        title: 'Liquidación de sueldo',
        items: [
            L(
                'Modelo de recibo (Excel)',
                'https://docs.google.com/spreadsheets/d/1RLN0FVoN9zeE7CF7pCheeOdPcPNtZMjC/edit',
            ),
            L(
                'Presentación',
                'https://drive.google.com/drive/u/0/folders/1gkSTI2Lv-8Sa1YRQEMxG7ccQTfBNCrf3',
            ),
            L(
                'Escalas CCT 547/08 · 08/2025',
                'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO',
            ),
            L(
                'Escalas CCT 547/08 · 12/2025',
                'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO',
            ),
            L(
                'Paritaria FAECYS-FAEVYT · 05/2026',
                'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO',
            ),
        ],
    },
];

export const RRHH_DATA: SectorIndexData = {
    kicker: 'empleado · políticas · liquidación',
    title: 'Recursos Humanos',
    num: '02',
    intro: 'Altas de personal, vacaciones, políticas, feriados, liquidación de sueldo y organigrama. Documentación oficial de Eurotur S.A. y Travel Designers S.A.',
    maint: 'Velázquez, Romina · actualizado 06·2026',
    groups: RRHH_GROUPS,
};

export const ADM_DATA: SectorIndexData = {
    kicker: 'legales · impositivos · bancarios · cuentas a pagar',
    title: 'Administración',
    num: '03',
    intro: 'Documentación legal, impositiva, bancaria, seguros y cuentas a pagar de Eurotur S.A. y Travel Designers S.A.',
    maint: 'Quintana, Elsa · Agüero, Leonela · Flores, María B. · act. 07·2026',
    groups: [
        {
            title: 'Aspectos legales',
            items: [
                L(
                    'DDJJ recepción facturas T',
                    'https://drive.google.com/drive/folders/1Y8w4rLzRTM1Kx7U9eL58fu_4SWaOMmvM',
                ),
                L(
                    'Habilitación municipal',
                    'https://drive.google.com/drive/folders/1Y8w4rLzRTM1Kx7U9eL58fu_4SWaOMmvM',
                ),
                L(
                    'Min. de Turismo — habilitaciones',
                    'https://drive.google.com/drive/folders/1xhuSF_B2r-b1beqoe20M1QtS9N4WWAre',
                ),
                L(
                    'Acta designación directorio (clave)',
                    'https://drive.google.com/drive/folders/1UYkxuwBIDqJN0LoObosAYk_PaU5OY9la',
                ),
                L(
                    'Estatutos (clave)',
                    'https://drive.google.com/drive/folders/1i5uWwC6d_LTHRvQr59q9vviM5S8vvVJJ',
                ),
                L(
                    'Poder general de admin. MZ (clave)',
                    'https://drive.google.com/drive/folders/1Tc3o59yODKPysQ3MKkMt-MZdinjDc90H',
                ),
            ],
        },
        {
            title: 'Aspectos impositivos',
            items: [
                L(
                    'Constancia CUIT Eurotur S.A.',
                    'https://drive.google.com/drive/folders/1eeFcxPvagetiTzxtFxunibo9Kbdth1hz',
                ),
                L(
                    'Constancia CUIT Travel Designers S.A.',
                    'https://drive.google.com/drive/folders/1eeFcxPvagetiTzxtFxunibo9Kbdth1hz',
                ),
                L(
                    'Ingresos brutos Eurotur S.A.',
                    'https://drive.google.com/drive/folders/1RRVZ0g8Q6TPaHUEN-EMCqnobP9G_XbFD',
                ),
                L(
                    'Ingresos brutos Travel Designers S.A.',
                    'https://drive.google.com/drive/folders/1RRVZ0g8Q6TPaHUEN-EMCqnobP9G_XbFD',
                ),
                L(
                    'Certificados MiPyme',
                    'https://drive.google.com/drive/u/0/folders/1LzoEK6buqxEMiW9IlBjnr3NyVh53qz1_',
                ),
            ],
        },
        {
            title: 'Datos bancarios',
            items: [
                L(
                    'Ciudad',
                    'https://drive.google.com/drive/folders/16HCS0kUKafBfQVhMceKNiAY4VPn2WMuk',
                ),
                L(
                    'Patagonia',
                    'https://drive.google.com/drive/folders/18AWK4aRdlWr3GQ2J0c0OpQlVR52L53Qt',
                ),
                L(
                    'Exterior',
                    'https://drive.google.com/drive/folders/18NfZslQ_oZYfptHRTvquEbn8PhTfHenk',
                ),
                L(
                    'Transferencia al exterior',
                    'https://docs.google.com/spreadsheets/d/1UCcDtwFNdxMfA5JZtipjStmyiXTCzmqk/edit',
                ),
            ],
        },
        {
            title: 'Pólizas de seguros',
            items: [
                L(
                    'Eurotur S.A.',
                    'https://drive.google.com/drive/folders/14UM1ur_nE_9ctehuYVNlzhmjXuLVFAdD',
                ),
                L(
                    'Travel Designers S.A.',
                    'https://drive.google.com/drive/folders/1YDItsG3qyEFY2Sqh_VBqLC3kKRJh-s5x',
                ),
            ],
        },
        {
            title: 'Cuentas a pagar',
            items: [
                T('Solicitud pago Comex — form en página'),
                L(
                    'DDJJ Reintegro IVA (Factura T)',
                    'https://drive.google.com/drive/folders/1_czEemImOk5cn2I2td4L6FelKAKCrfOW',
                ),
                L(
                    'Formulario rendición de gastos',
                    'https://drive.google.com/drive/u/0/folders/1rRgOCZ8QBBin6Qgjmnxb-cGbwJhm_5I_',
                ),
                L(
                    'Affidavit Eurotur LLC',
                    'https://docs.google.com/document/d/1k6qnapxbrIn0AURjEyQZKYNjRi2w8ggh/edit',
                ),
            ],
        },
        {
            title: 'Balances (clave)',
            items: [
                L(
                    'Eurotur S.A.',
                    'https://drive.google.com/drive/folders/1nWVLn72ImqaS-hw--z9tnKsDdj0ST2_o',
                ),
                L(
                    'Travel Designers S.A.',
                    'https://drive.google.com/drive/folders/1wrrk3uSWgTZPuC5AvlQOvY-Nin6NW9Ir',
                ),
            ],
        },
        {
            title: 'Instructivos',
            items: [
                L(
                    'Cierre de módulo mensual',
                    'https://drive.google.com/drive/folders/1mWxtqI1mgSq6gx2b7IHbsA4BNek9zZSD',
                ),
                L(
                    'Pre-Balance de Módulos — cómo se usa',
                    '/documentos/prebalance-modulos.docx',
                ),
            ],
        },
        {
            title: 'Contabilidad · Cierre mensual',
            items: [
                {
                    t: 'Pre-Balance de Módulos — herramienta',
                    h: '/adm/prebalance',
                    badge: 'En prueba — Contabilidad',
                },
                L(
                    'Pre-Balance de Módulos — documentación',
                    '/documentos/prebalance-modulos.docx',
                ),
            ],
        },
    ],
};

export const CONTRATACIONES_DATA: SectorIndexData = {
    kicker: 'servicios · hotelería · proveedores',
    title: 'Contrataciones',
    num: '04',
    intro: 'Transportistas, hotelería, alta de proveedores, sucursales y procedimientos del sector.',
    maint: 'Garrigo, Mariana · Dis, Paula · act. 06·2026',
    groups: [
        {
            title: 'Servicios',
            items: [
                L(
                    'Transportistas (BUE·FTE·USH·SLA)',
                    'https://drive.google.com/drive/folders/1di7_cCAdfVbU3SE3gI-t8WuEgDq7IfsM',
                ),
                L(
                    'Bases de vehículos',
                    'https://docs.google.com/spreadsheets/d/1zI0Y06ekIEJJ5-UoxLzAYDE3hQhMqN6iD1xKal9GXhM/edit',
                ),
                L(
                    'Rent-a-Car: tarifarios clientes',
                    'https://drive.google.com/drive/folders/1Bg0iCyfn5q1Z46ZMYyQ30QCXKUm4bI6g',
                ),
            ],
        },
        {
            title: 'Hotelería',
            items: [
                L(
                    'Comparativos de hoteles',
                    'https://drive.google.com/drive/folders/1y2y-fAsmKVlgPtTGgXMV3urxDQU7R6Hy',
                ),
                L(
                    'Hoteles recomendados',
                    'https://docs.google.com/spreadsheets/d/1kwqVIy2-rw2zR9h7JUkDaIlPHU6b0w9ZcwNX5Du_gQQ/edit',
                ),
                L(
                    'Hoteles vinculados a Hyperguest',
                    'https://docs.google.com/spreadsheets/d/19g-8wGzvnwT45l_Ga3SEJyBMazhSlryf5uClOzpHKgY/edit',
                ),
            ],
        },
        {
            title: 'Interno',
            items: [
                L(
                    'Responsables — distribución interna',
                    'https://docs.google.com/spreadsheets/d/1kQM_8I9p0coDhh8UH8bjD0OuDlTqiOPX7G7brSPcaVo/edit',
                ),
            ],
        },
        {
            title: 'Sucursales',
            items: [
                L(
                    'Interagencias (USH)',
                    'https://drive.google.com/drive/folders/1rQeCVBCjZPHu1DEr27qPuhRqBUEYlftI',
                ),
                L(
                    'Interagencias (FTE)',
                    'https://drive.google.com/drive/folders/1xdUx_IJasHrEGlnRDW7xoIC8i7I8_3RA',
                ),
                L(
                    'Interagencias (SLA) y SIBs',
                    'https://docs.google.com/spreadsheets/d/1iSELrVdPylVbH0Fz-NfRjjuGPhWeQ6LiLQMOQC3UUTU/edit',
                ),
            ],
        },
        {
            title: 'Alta de proveedor',
            items: [
                L('Servicios / Hoteles', 'https://forms.gle/TbejmP67EnMZMuus9'),
                L('Transportista', 'https://forms.gle/61BbkyprUocRgLAh8'),
                L('Guías', 'https://forms.gle/yVsXMkYER3g7bmdx5'),
            ],
        },
        {
            title: 'Procedimientos',
            items: [
                L(
                    'Procedimientos',
                    'https://drive.google.com/drive/folders/1DtU-HYvAm4aijJ7En1wh-gSOvG9lnSAT',
                ),
            ],
        },
    ],
};

export const OPERACIONES_DATA: SectorIndexData = {
    kicker: 'bue · fte · ush · sla',
    title: 'Operaciones',
    num: '05',
    intro: 'Instrucciones, procedimientos e instructivos operativos por oficina — Buenos Aires y sucursales.',
    maint: 'Juliano, María Valeria · act. 06·2026',
    groups: [
        {
            title: 'Operaciones',
            items: [
                L(
                    'Instrucciones & procedimientos',
                    'https://drive.google.com/drive/u/0/folders/1SFypymYk36FFEls5jtPui-RV63vlcmav',
                ),
                L(
                    'FITs',
                    'https://drive.google.com/drive/u/0/folders/1GaWceN_6C8KdHxcXZbdQLWEE4NIla8bi',
                ),
                L(
                    'Grupos',
                    'https://drive.google.com/drive/u/0/folders/1r1brPFqLV9imltVtzXZNrVZi5u09YMcY',
                ),
                L(
                    'Aéreos',
                    'https://drive.google.com/drive/u/0/folders/1YyXxhXl5xwWl-w4ZB-XvDh-uwrKtGBY7',
                ),
                L(
                    'Contingencias (histórico)',
                    'https://drive.google.com/drive/folders/1UCFuMzJu4cWBSZVoOt_U8tDS8ekPZTZl',
                ),
            ],
        },
        {
            title: 'Grupos — detalle',
            items: [
                L(
                    'Información varia',
                    'https://drive.google.com/drive/u/0/folders/14xXTAVgCLda9Hlo9MRWSSb-PK54kdT1z',
                ),
                L(
                    'Instructivos',
                    'https://drive.google.com/drive/u/0/folders/1HvnUL76LW1GVAZKUa-lM4QCWY7l8yrIO',
                ),
                L(
                    'Cotización · parámetros',
                    'https://drive.google.com/drive/u/0/folders/1r1v1glRhprE5sP0FPN2hgX3dDzhB4xQ2',
                ),
            ],
        },
        {
            title: 'Buenos Aires / equipos',
            items: [
                L(
                    'Sucursales',
                    'https://drive.google.com/drive/folders/1hjiMnQvwWiGKuGxs4Y_n1dbtcf7ZrANY',
                ),
                L(
                    'Equipos',
                    'https://drive.google.com/drive/u/0/folders/1J6wS2wl6sD6CFlIup2Egco2D1h4KyJ3Y',
                ),
                L(
                    'Planillas operativas',
                    'https://drive.google.com/drive/u/0/folders/1SJpvSK6w5zm1p0D-wxLjgeyBLyeXmd-H',
                ),
                L(
                    'Links tarifarios',
                    'https://drive.google.com/drive/u/0/folders/1yJcAQLCXjJ2rbDGcgFlP9wzJY-hMQIsx',
                ),
                L(
                    'Bloqueos',
                    'https://drive.google.com/drive/u/0/folders/1CCRGB60vvTK-Dlwy4LBvztHSQPSIZTRQ',
                ),
                L(
                    'Cierres',
                    'https://drive.google.com/drive/u/0/folders/1HeE9AIjIbTwXwj3b0F_cPaCAeQyGIrVM',
                ),
            ],
        },
        {
            title: 'Instructivos · BUE',
            items: [
                L(
                    'Procedimientos',
                    'https://drive.google.com/drive/u/0/folders/1Au8_BCWEvUxtMHW9_ep3ZIeR9GVfH8ub',
                ),
                L(
                    'Guías',
                    'https://drive.google.com/drive/u/0/folders/1l86WWld2cLW4YPcO8VQGD8qmNzJ934Gj',
                ),
                L(
                    'Transporte',
                    'https://drive.google.com/drive/u/0/folders/141CZ5N2bao7LXWNG4rSxG4pd6lEO2pyI',
                ),
                L(
                    'Seguridad',
                    'https://drive.google.com/drive/u/0/folders/1ShCxFq8mQOA8MIXSiJ2_gnHK5ghv-qH0',
                ),
            ],
        },
        {
            title: 'Instructivos · sucursales',
            items: [
                L(
                    'Procedimientos',
                    'https://drive.google.com/drive/u/0/folders/1p51-4Ha2UFvzdT1iiCFVQ6GBkmfFFfWo',
                ),
                L(
                    'Vencimientos oficinas y flota TD',
                    'https://drive.google.com/drive/u/0/folders/1LlCZg9lGNO1XOXBqkpfRikumPWracUw2',
                ),
            ],
        },
        {
            title: 'Ushuaia',
            items: [
                L(
                    'Guías',
                    'https://drive.google.com/drive/u/0/folders/1sUJFCPqkXgYa3eKYiXOBZ44Inn0G9ef9',
                ),
                L(
                    'Transporte',
                    'https://drive.google.com/drive/u/0/folders/1wP-Kfz3w_GGyuxaaUMRrCTZiKOusyzmp',
                ),
                L(
                    'Restaurantes (uso interno)',
                    'https://sites.google.com/eurotur.tur.ar/restaurantesushuaia',
                ),
            ],
        },
        {
            title: 'Calafate',
            items: [
                L(
                    'Guías',
                    'https://drive.google.com/drive/u/0/folders/1y8wOktFPvV61xhc2vVoB-FE5673mIB48',
                ),
                L(
                    'Transporte',
                    'https://drive.google.com/drive/folders/1XFfJDVP-OD7PsYTffVm-lbwz6ZkKD0pK',
                ),
                L(
                    'Restaurantes (uso interno)',
                    'https://sites.google.com/eurotur.tur.ar/restaurantescalafate/inicio',
                ),
            ],
        },
        {
            title: 'Salta',
            items: [
                L(
                    'Apertura',
                    'https://drive.google.com/drive/u/0/folders/1Ked6Y5h1L3oFZiTV7Sk0ichkUDRrqHTF',
                ),
                T('Guías / Transporte / Restaurantes — en preparación'),
            ],
        },
    ],
};

export const PRODUCTO_DATA: SectorIndexData = {
    kicker: 'herramientas · fichas · reportes',
    title: 'Producto',
    num: '06',
    intro: 'Herramientas, fichas técnicas, reportes, novedades y fotos de producto.',
    maint: 'Carrizo, C. · Aleu, M. · Carbajo, A. · act. 06·2026',
    groups: [
        {
            title: 'Herramientas',
            items: [
                L(
                    'Políticas de menores',
                    'https://drive.google.com/drive/u/0/folders/1HwIbaVKHd4L_GrjnopcKAMv7k4hJUgpG',
                ),
                L(
                    'Horario de excursiones',
                    'https://drive.google.com/drive/u/0/folders/18Im6qWJZwrZlbQBHXOot8zQ0U1lqE8fB',
                ),
                L(
                    'Fichas técnicas Tango',
                    'https://drive.google.com/drive/u/0/folders/1_TRFlwGeN_p1rwYhIUVflPkjPYxPTI8k',
                ),
                L(
                    'Ficha hoteles',
                    'https://drive.google.com/drive/u/0/folders/1qqZ4KWzg_mwqO0oXpYIgstbBZjSvlbGe',
                ),
                L(
                    'Family Plan',
                    'https://drive.google.com/drive/u/0/folders/1O83oWF5hO62efF1UGLAypLXbjCCJgNdj',
                ),
                L(
                    'Comparativas',
                    'https://drive.google.com/drive/u/0/folders/16EtqTxkRcfGtSQX30un4-N0NGrb4j6Os',
                ),
                L(
                    'Base vehículos',
                    'https://drive.google.com/drive/u/0/folders/1Lwp2HRaRNtOt64nonTcuWkWIUi7o4_-w',
                ),
                L(
                    'Tours de Buenos Aires',
                    'https://drive.google.com/drive/u/0/folders/1jeBQOfsRgpcgwsAv1NccCR4I5-ovPxpN',
                ),
            ],
        },
        {
            title: 'Reportes',
            items: [
                L(
                    'Reporte',
                    'https://docs.google.com/document/d/1PpJk07lmw7PGilul4zqlS54ZEnSGC-zV/edit',
                ),
                L(
                    'Productos',
                    'https://drive.google.com/drive/u/0/folders/1sgazGsnLQj5m9AabP-uZ5UPeC2ICeNH1',
                ),
                L(
                    'Sites hoteles',
                    'https://drive.google.com/drive/u/0/folders/1-4ICNSD-bInkaTiKraxhwQzXRHynX3zm',
                ),
            ],
        },
        {
            title: 'Internas',
            items: [
                L(
                    'Procedimientos internos',
                    'https://drive.google.com/drive/u/0/folders/14yI4_JqsRObmD9QBf6pxBisPM9J6G6mK',
                ),
            ],
        },
        {
            title: 'Novedades',
            items: [
                L(
                    'Novedades productos',
                    'https://drive.google.com/drive/u/0/folders/1HGEFn6CxJKzPh2JMZXK07v1-vc5ljE0h',
                ),
            ],
        },
        {
            title: 'Fotos',
            items: [
                L(
                    'Hoteles',
                    'https://drive.google.com/drive/u/0/folders/1vaFB4CVKaLSN1MLPl5Cdnu2tWh3dAwyx',
                ),
                L(
                    'Atractivos',
                    'https://drive.google.com/drive/u/0/folders/1ZUd_jV62Q078V3Xjso7e3bCB4wVEjDys',
                ),
                T('Presentaciones — en preparación'),
            ],
        },
    ],
};

export const CUSTOMERCARE_DATA: SectorIndexData = {
    kicker: 'estandarización · pasajeros',
    title: 'Customer Care',
    num: '07',
    intro: 'Estandarización de servicios, notas a pasajeros en 4 idiomas y procedimientos de atención.',
    maint: 'Customer Care · en revisión',
    groups: [
        {
            title: 'Reportes',
            items: [
                L(
                    'Reporte final de temporadas',
                    'https://drive.google.com/drive/folders/1hnGCFM2a69of_6LBE9wlsZrKxOsNnitD',
                ),
            ],
        },
        {
            title: 'Estandarización de servicios',
            items: [
                L(
                    'Estandarización Eurotur 2025',
                    'https://drive.google.com/drive/folders/1tagtLwhKKX5CuaWb4vY7SbN1uCZpxTUl',
                ),
                L(
                    'Mensajes estandarizados BUE·FTE·USH',
                    'https://docs.google.com/document/d/1FK3zEhXnd8kmU6T6785WFKuGw3M9zxTN/edit',
                ),
            ],
        },
        {
            title: 'Nota a los pasajeros',
            items: [
                L(
                    'Español',
                    'https://drive.google.com/drive/folders/1IHCup3ssmm2GkEVeRVTwach-jzQD4t49',
                ),
                L(
                    'Inglés',
                    'https://drive.google.com/drive/folders/1YI6h6zGjjFLQJ_VeDc8pGtXhgb5NDiaG',
                ),
                L(
                    'Francés',
                    'https://drive.google.com/drive/folders/12dSQnvvjtzaBLtxZ4iaFk_dat5_ask92',
                ),
                L(
                    'Italiano',
                    'https://drive.google.com/drive/folders/1WJH6-Kh0TvxLkUg4TJiFLKTEDQBTnFQq',
                ),
            ],
        },
        {
            title: 'Procedimientos',
            items: [
                L(
                    'Emisión de documentación en TP',
                    'https://drive.google.com/drive/folders/1k-DepkqG3gBHehkYCYlkYz0fEZpMhErp',
                ),
                L(
                    'Servicio de Concierge',
                    'https://drive.google.com/drive/folders/1PVtgEdUIYjojH_NGDWqSel_f_nvtSX3Z',
                ),
            ],
        },
    ],
};

export const SALES_DATA: SectorIndexData = {
    kicker: 'clientes · comercial',
    title: 'Sales',
    num: '09',
    intro: 'Clientes y material comercial. Sección en ampliación — candidata a fusión con otras áreas.',
    maint: 'Comercial · en ampliación',
    groups: [
        {
            title: 'Clientes',
            items: [
                L(
                    'Clientes',
                    'https://drive.google.com/drive/folders/1vxWJN6PJMDQIq6Ayk1XDRlL-b5ntjYWw',
                ),
                T('Sección en ampliación'),
            ],
        },
    ],
};

export const TRAVELDESIGNERS_DATA: SectorIndexData = {
    kicker: 'manuales · convivencia',
    title: 'Travel Designers',
    num: '10',
    intro: 'Manuales y documentación de Travel Designers S.A. — Av. Montes de Oca 2238, CABA.',
    maint: 'Travel Designers · en revisión',
    groups: [
        {
            title: 'Información',
            items: [
                L(
                    'Manual de conductores/as',
                    'https://drive.google.com/drive/u/0/folders/166lJNjbeaRrE272XPPRCr-ollXUqeVsc',
                ),
                L(
                    'Manual de convivencia',
                    'https://drive.google.com/drive/u/0/folders/16BCxu_MZyx5WA_3vjJA6dNk2xkpXw3O1',
                ),
                L(
                    'Simulacro de recibo de haberes',
                    'https://drive.google.com/drive/u/0/folders/1ixZQMHj3CymaSnMuIQKAjzTdu7gcHLJU',
                ),
            ],
        },
        {
            title: 'Dirección',
            items: [T('Av. Montes de Oca 2238, CABA')],
        },
    ],
};

export const IT_DATA: SectorIndexData = {
    kicker: 'sistemas · soporte · telefonía',
    title: 'IT',
    num: '11',
    intro: 'Ticketera, procedimientos, manuales e instructivos de sistemas, telefonía y acceso remoto.',
    maint: 'Fuentes, Yenedier · act. 06·2026',
    groups: [
        {
            title: 'Ticketera & soporte',
            items: [
                L(
                    'Ticketera',
                    'https://docs.google.com/forms/d/e/1FAIpQLSeyq0O-jjq9FRdLqdL8NeOuDogy0VrRfvspfBXU7-3_AO64rA/viewform',
                ),
                L(
                    'Gestión soporte interno',
                    'https://drive.google.com/drive/folders/11VgSUUrIjarUZW3OfcCR-huLJsWVehY0',
                ),
                L(
                    'Informe de backups (clave)',
                    'https://drive.google.com/drive/folders/1KH4U7tGSAiiTtSVdgdCsACXNGh-ijnfl',
                ),
            ],
        },
        {
            title: 'Seguridad & manuales',
            items: [
                L(
                    'Ciberataques',
                    'https://docs.google.com/presentation/d/1YK6CTvN4Fowmuvt0ai7XAU73NM-7zhMb/edit',
                ),
                L(
                    'Tango / Delta (Axoft)',
                    'https://ayudas.axoft.com/21ar/documentos/operacion/',
                ),
                T('Proveedores: Tec 5 · IPLAN · METROTEL'),
            ],
        },
        {
            title: 'Sistemas',
            items: [
                L(
                    'Tourplan',
                    'https://drive.google.com/drive/folders/1y7JY1XX1Cu1ydwA-E_LY1vYjoI9IFmpt',
                ),
                L(
                    'Tourplan — instructivos',
                    'https://drive.google.com/drive/folders/1xK4pC-HiQ3nFXaEPIJ0zwhy2WoWFrJ0s',
                ),
                L(
                    'Sabre',
                    'https://drive.google.com/drive/folders/1P4X3YKHLt5ZST6YokWcsJgMAOMpEoT9J',
                ),
                L(
                    'Sabre — descargar',
                    'https://www.sabre.com/products/suites/customer-touchpoints/sabre-red-360/',
                ),
                L(
                    'IDB / BOT',
                    'https://indatabiz.com/soporte/doc/entendiendo-idb-glider-y-su-principio-de-funcionamiento/',
                ),
            ],
        },
        {
            title: 'Telefonía & internos',
            items: [
                L(
                    'Zoiper — presentación',
                    'https://docs.google.com/presentation/d/1XuEdYtfSYAuZGh0uw20nxzQukcy71tvWhMAHnvxvNq4/edit',
                ),
                L(
                    'Zoiper PC',
                    'https://docs.google.com/document/d/1Ai1EvGJ75opFN7n_XjJswqOoUHYDGTTF/edit',
                ),
                L(
                    'Zoiper celular',
                    'https://drive.google.com/drive/u/0/folders/1sq_P9iZJmIYhPwLdmjPWGryNCKk9NsQr',
                ),
                L(
                    'Internos Eurotur',
                    'https://docs.google.com/spreadsheets/d/17_yPlbkFWjTYLPNz7TCRf_pXSp_XIXOy/edit',
                ),
                L(
                    'Plano de internos',
                    'https://drive.google.com/drive/u/0/folders/1UV8XKwPEm_U470vl-58MUVL-J1f-Dj6j',
                ),
            ],
        },
        {
            title: 'Google Meet & Gmail',
            items: [
                L(
                    'Audio notebook para Meet',
                    'https://docs.google.com/document/d/1pasl8bOXJTSpv447ueah1m7KB7Ro-a2v/edit',
                ),
                L(
                    'Fondo en reuniones Meet',
                    'https://drive.google.com/drive/u/0/folders/1T11gNO9I45pHtctv3C-vIMS0nnaP5cV0',
                ),
                L(
                    'Delegación de permisos en Gmail',
                    'https://drive.google.com/drive/u/0/folders/1D0fQuSnomiZfXVGfiiMuvK6eWl0yYdNg',
                ),
                L(
                    'Complementos Excel (Disco T)',
                    'https://drive.google.com/drive/folders/1TtmqBMJDBpgYtnrihCJNkOrvp694ybD9',
                ),
            ],
        },
        {
            title: 'Equipos & acceso remoto',
            items: [
                L(
                    'Notebook — instructivo',
                    'https://drive.google.com/drive/folders/10lZVU9urVZfJ9aXiSau9H3d-rZn8Kyc4',
                ),
                L(
                    'VPN Forticlient / IPSec',
                    'https://drive.google.com/drive/folders/1IcY-SmWA-ZfhzMernOiXl05mGJCcSNU7',
                ),
                L(
                    'Guacamole (fuera de Argentina)',
                    'https://remoto.eurotur.tur.ar/',
                ),
            ],
        },
    ],
};

export const RESPONSABLES_DATA: SectorIndexData = {
    kicker: 'mantenimiento del portal',
    title: 'Responsables del Portal',
    num: '13',
    intro: 'Quién mantiene cada sección del portal. Cada área figura también al pie de su página con «mantiene—».',
    maint: 'De Bin, Aldo · act. 07·2026',
    groups: [
        { title: 'Institucional', items: [T('De Bin, Aldo')] },
        { title: 'RRHH', items: [T('Velázquez, Romina')] },
        { title: 'Guía telefónica', items: [T('Velázquez, Romina')] },
        { title: 'Impuestos & Legales', items: [T('Quintana, Elsa')] },
        { title: 'Datos bancarios y pólizas', items: [T('Agüero, Leonela')] },
        { title: 'Cuentas a pagar', items: [T('Flores, María Beatriz')] },
        { title: 'Operaciones', items: [T('Juliano, María Valeria')] },
        {
            title: 'Contrataciones',
            items: [T('Garrigo, Mariana · Dis, Paula')],
        },
        {
            title: 'Producto',
            items: [T('Carrizo, C. · Aleu, M. · Carbajo, A.')],
        },
        {
            title: 'Comercial',
            items: [
                T('Zanone · Meyoyan · Carrizo · Lezcano · Clement · Bonserio'),
            ],
        },
        { title: 'IT', items: [T('Fuentes, Yenedier')] },
        { title: 'Cotización Dólar', items: [T('Fuentes, Yenedier')] },
        {
            title: 'Contabilidad · Pre-Balance',
            items: [T('Quintana, Elsa')],
        },
    ],
};
