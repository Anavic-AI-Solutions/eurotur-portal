import {
    adm,
    contrataciones,
    customercare,
    exchangeRate,
    innovacion,
    institucional,
    it,
    mesa,
    operaciones,
    producto,
    qrated,
    responsables,
    rrhh,
    sales,
    searchAdmin,
    traveldesigners,
} from '@/routes/portal';
import type { RouteDefinition } from '@/wayfinder';

export type SectorId =
    | 'institucional'
    | 'rrhh'
    | 'adm'
    | 'contrataciones'
    | 'operaciones'
    | 'producto'
    | 'customercare'
    | 'qrated'
    | 'sales'
    | 'traveldesigners'
    | 'it'
    | 'mesa'
    | 'responsables'
    | 'innovacion'
    | 'exchange-rate'
    | 'search-admin';

export type ActiveView = 'home' | SectorId;

export type Sector = {
    id: SectorId;
    num: string;
    navLabel: string;
    shortLabel: string;
    place: string;
    href: RouteDefinition<'get'>;
};

export const SECTORS: Sector[] = [
    {
        id: 'institucional',
        num: '01',
        navLabel: 'Institucional',
        shortLabel: 'Institucional',
        place: 'buenos aires',
        href: institucional(),
    },
    {
        id: 'rrhh',
        num: '02',
        navLabel: 'RRHH',
        shortLabel: 'RRHH',
        place: 'equipo',
        href: rrhh(),
    },
    {
        id: 'adm',
        num: '03',
        navLabel: 'Administración, Impuestos y Legales',
        shortLabel: 'Administración',
        place: 'documentos',
        href: adm(),
    },
    {
        id: 'contrataciones',
        num: '04',
        navLabel: 'Contrataciones',
        shortLabel: 'Contrataciones',
        place: 'flota',
        href: contrataciones(),
    },
    {
        id: 'operaciones',
        num: '05',
        navLabel: 'Operaciones',
        shortLabel: 'Operaciones',
        place: 'perito moreno',
        href: operaciones(),
    },
    {
        id: 'producto',
        num: '06',
        navLabel: 'Producto',
        shortLabel: 'Producto',
        place: 'excursiones',
        href: producto(),
    },
    {
        id: 'customercare',
        num: '07',
        navLabel: 'Customer Care',
        shortLabel: 'Customer Care',
        place: 'pasajeros',
        href: customercare(),
    },
    {
        id: 'qrated',
        num: '08',
        navLabel: 'Qrated',
        shortLabel: 'Qrated',
        place: 'premium · mice',
        href: qrated(),
    },
    {
        id: 'sales',
        num: '09',
        navLabel: 'Sales',
        shortLabel: 'Sales',
        place: 'clientes',
        href: sales(),
    },
    {
        id: 'traveldesigners',
        num: '10',
        navLabel: 'Travel Designers',
        shortLabel: 'Travel Designers',
        place: 'ruta 40',
        href: traveldesigners(),
    },
    {
        id: 'it',
        num: '11',
        navLabel: 'IT',
        shortLabel: 'IT',
        place: 'sistemas',
        href: it(),
    },
    {
        id: 'mesa',
        num: '12',
        navLabel: 'Mesa de Información',
        shortLabel: 'Mesa de Info',
        place: 'soporte',
        href: mesa(),
    },
    {
        id: 'responsables',
        num: '13',
        navLabel: 'Responsables del Portal',
        shortLabel: 'Responsables',
        place: 'portal',
        href: responsables(),
    },
    {
        id: 'innovacion',
        num: '14',
        navLabel: 'Innovación',
        shortLabel: 'Innovación',
        place: 'ia · scripts',
        href: innovacion(),
    },
    {
        id: 'exchange-rate',
        num: '15',
        navLabel: 'Tipo de Cambio',
        shortLabel: 'Tipo de Cambio',
        place: 'iata · bna',
        href: exchangeRate(),
    },
    {
        id: 'search-admin',
        num: '16',
        navLabel: 'Buscador',
        shortLabel: 'Buscador',
        place: 'keywords · tesauro',
        href: searchAdmin(),
    },
];
