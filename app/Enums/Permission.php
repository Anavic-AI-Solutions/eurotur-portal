<?php

namespace App\Enums;

/**
 * The single source of truth for the permission catalogue. The `permissions`
 * table is a projection of this enum, kept in sync by RolePermissionSeeder.
 */
enum Permission: string
{
    case SectorRrhhEdit = 'sector.rrhh.edit';
    case SectorAdmEdit = 'sector.adm.edit';
    case SectorContratacionesEdit = 'sector.contrataciones.edit';
    case SectorOperacionesEdit = 'sector.operaciones.edit';
    case SectorProductoEdit = 'sector.producto.edit';
    case SectorCustomercareEdit = 'sector.customercare.edit';
    case SectorSalesEdit = 'sector.sales.edit';
    case SectorTraveldesignersEdit = 'sector.traveldesigners.edit';
    case SectorItEdit = 'sector.it.edit';
    case SectorResponsablesEdit = 'sector.responsables.edit';

    case InnovacionManage = 'innovacion.manage';
    case ExchangeRateManage = 'exchange-rate.manage';
    case SearchAdmin = 'search.admin';

    case UsersManage = 'users.manage';
    case RolesManage = 'roles.manage';

    public static function forSector(EditableSector $sector): self
    {
        return self::from("sector.{$sector->value}.edit");
    }

    public function label(): string
    {
        return match ($this) {
            self::SectorRrhhEdit => 'Editar sector RRHH',
            self::SectorAdmEdit => 'Editar sector Administración',
            self::SectorContratacionesEdit => 'Editar sector Contrataciones',
            self::SectorOperacionesEdit => 'Editar sector Operaciones',
            self::SectorProductoEdit => 'Editar sector Producto',
            self::SectorCustomercareEdit => 'Editar sector Customer Care',
            self::SectorSalesEdit => 'Editar sector Sales',
            self::SectorTraveldesignersEdit => 'Editar sector Travel Designers',
            self::SectorItEdit => 'Editar sector IT',
            self::SectorResponsablesEdit => 'Editar sector Responsables',
            self::InnovacionManage => 'Gestionar frentes e iniciativas',
            self::ExchangeRateManage => 'Gestionar cotizaciones del BNA',
            self::SearchAdmin => 'Administrar el buscador',
            self::UsersManage => 'Gestionar usuarios',
            self::RolesManage => 'Gestionar roles y permisos',
        };
    }

    public function group(): string
    {
        return match ($this) {
            self::UsersManage, self::RolesManage => 'administracion',
            self::InnovacionManage, self::ExchangeRateManage, self::SearchAdmin => 'contenido',
            default => 'sectores',
        };
    }

    /**
     * @return list<self>
     */
    public static function sectorPermissions(): array
    {
        return array_map(self::forSector(...), EditableSector::cases());
    }

    /**
     * Permissions that imply being able to edit portal content, i.e. the
     * backing set for the legacy `editar-portal` gate.
     *
     * @return list<self>
     */
    public static function contentPermissions(): array
    {
        return [
            ...self::sectorPermissions(),
            self::InnovacionManage,
            self::ExchangeRateManage,
            self::SearchAdmin,
        ];
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return array<string, string>
     */
    public static function groupLabels(): array
    {
        return [
            'sectores' => 'Sectores',
            'contenido' => 'Contenido del portal',
            'administracion' => 'Administración',
        ];
    }
}
