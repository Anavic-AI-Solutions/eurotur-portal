<?php

namespace App\Enums;

/**
 * Mirrors the exact role values the Panel de Prepagos microservice expects
 * in the `X-Portal-Rol` header (see persistencia.resolver_usuario_portal).
 */
enum PrepagosRole: string
{
    case Supervisor = 'SUPERVISOR';
    case Analista = 'ANALISTA';

    public function label(): string
    {
        return match ($this) {
            self::Supervisor => 'Supervisor',
            self::Analista => 'Analista',
        };
    }
}
