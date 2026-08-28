import { usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

/**
 * Reads the permission slugs shared by HandleInertiaRequests. Admins receive
 * the full catalogue server-side, so `can` needs no special case for them.
 */
export function usePermissions() {
    const { auth } = usePage().props;
    const permissions = useMemo(
        () => auth?.permissions ?? [],
        [auth?.permissions],
    );

    const can = useCallback(
        (permission: string) => permissions.includes(permission),
        [permissions],
    );

    const canAny = useCallback(
        (...candidates: string[]) =>
            candidates.some((permission) => permissions.includes(permission)),
        [permissions],
    );

    return { can, canAny, permissions, role: auth?.role ?? null };
}

export const sectorPermission = (sector: string) => `sector.${sector}.edit`;
