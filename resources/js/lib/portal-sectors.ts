import {
    adm,
    contrataciones,
    customercare,
    exchangeRate,
    innovacion,
    institucional,
    it,
    mesa,
    meetingRoom,
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
    | 'search-admin'
    | 'meeting-room';

export type ActiveView = 'home' | SectorId;

export type Sector = {
    id: SectorId;
    num: string;
    navLabel: string;
    shortLabel: string;
    place: string;
    href: RouteDefinition<'get'>;
    /** When set, the nav entry is hidden from users lacking this permission. */
    requiredPermission?: string;
    /** Override the default sector tile image (defaults to /img/portal/sectores/{id}.webp). */
    photo?: string;
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
        id: 'sales',
        num: '02',
        navLabel: 'Sales',
        shortLabel: 'Sales',
        place: 'clientes',
        href: sales(),
    },
    {
        id: 'customercare',
        num: '03',
        navLabel: 'Customer Care',
        shortLabel: 'Customer Care',
        place: 'pasajeros',
        href: customercare(),
    },
    {
        id: 'producto',
        num: '04',
        navLabel: 'Producto',
        shortLabel: 'Producto',
        place: 'excursiones',
        href: producto(),
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
        id: 'contrataciones',
        num: '06',
        navLabel: 'Contrataciones',
        shortLabel: 'Contrataciones',
        place: 'flota',
        href: contrataciones(),
    },
    {
        id: 'rrhh',
        num: '07',
        navLabel: 'RRHH',
        shortLabel: 'RRHH',
        place: 'equipo',
        href: rrhh(),
    },
    {
        id: 'adm',
        num: '08',
        navLabel: 'Administración, Impuestos y Legales',
        shortLabel: 'Administración',
        place: 'documentos',
        href: adm(),
    },
    {
        id: 'search-admin',
        num: '09',
        navLabel: 'Buscador',
        shortLabel: 'Buscador',
        place: 'keywords · tesauro',
        href: searchAdmin(),
        requiredPermission: 'search.admin',
    },
    {
        id: 'it',
        num: '10',
        navLabel: 'IT',
        shortLabel: 'IT',
        place: 'sistemas',
        href: it(),
    },
    {
        id: 'mesa',
        num: '11',
        navLabel: 'Mesa de Información',
        shortLabel: 'Mesa de Info',
        place: 'soporte',
        href: mesa(),
    },
    {
        id: 'qrated',
        num: '12',
        navLabel: 'Qrated',
        shortLabel: 'Qrated',
        place: 'premium · mice',
        href: qrated(),
    },
    {
        id: 'meeting-room',
        num: '13',
        navLabel: 'Sala de Reuniones',
        shortLabel: 'Sala de Reuniones',
        place: 'reservas · calendar',
        href: meetingRoom(),
        photo: '/img/portal/sectores/meeting-room.png',
    },
    {
        id: 'exchange-rate',
        num: '14',
        navLabel: 'Tipo de Cambio',
        shortLabel: 'Tipo de Cambio',
        place: 'iata · bna',
        href: exchangeRate(),
    },
    {
        id: 'traveldesigners',
        num: '15',
        navLabel: 'Travel Designers',
        shortLabel: 'Travel Designers',
        place: 'ruta 40',
        href: traveldesigners(),
    },
    {
        id: 'innovacion',
        num: '16',
        navLabel: 'Innovación',
        shortLabel: 'Innovación',
        place: 'ia · scripts',
        href: innovacion(),
    },
    {
        id: 'responsables',
        num: '17',
        navLabel: 'Responsables del Portal',
        shortLabel: 'Responsables',
        place: 'portal',
        href: responsables(),
    },
];
