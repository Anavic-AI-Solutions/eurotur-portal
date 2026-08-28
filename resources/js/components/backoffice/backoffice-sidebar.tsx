import { Link, usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { home } from '@/routes';
import { index as rolesIndex } from '@/routes/admin/roles';
import { index as usersIndex } from '@/routes/admin/users';

type NavEntry = {
    label: string;
    href: ReturnType<typeof usersIndex>;
    permission: string;
    match: string;
};

const ITEMS: NavEntry[] = [
    {
        label: 'Usuarios',
        href: usersIndex(),
        permission: 'users.manage',
        match: '/administracion/usuarios',
    },
    {
        label: 'Roles',
        href: rolesIndex(),
        permission: 'roles.manage',
        match: '/administracion/roles',
    },
];

/**
 * The backoffice's own nav, deliberately not shadcn's Sidebar: a fixed
 * 216px panel with a hairline border reads closer to the portal than the
 * collapsible/sheet machinery that component brings.
 */
export function BackofficeSidebar({ onNavigate }: { onNavigate?: () => void }) {
    const { url } = usePage();
    const { can } = usePermissions();
    const items = ITEMS.filter((item) => can(item.permission));

    return (
        <div className="flex h-full w-[216px] shrink-0 flex-col border-r border-border px-[22px] pt-[34px] pb-7">
            <Link
                href={home()}
                onClick={onNavigate}
                className="block"
                style={{ all: 'unset', cursor: 'pointer', display: 'block' }}
            >
                <img
                    src="/eurotur-logo.png"
                    alt="Eurotur — 70 años"
                    style={{ width: '118px', height: 'auto', display: 'block' }}
                />
                <div className="mt-[10px] bo-eyebrow">Backoffice</div>
            </Link>

            <div className="my-[24px] h-px bg-foreground" />

            <nav className="flex flex-1 flex-col gap-[2px]">
                {items.map((item) => {
                    const active = url.startsWith(item.match);

                    return (
                        <Link
                            key={item.match}
                            href={item.href}
                            onClick={onNavigate}
                            className={
                                'px-[6px] py-[7px] text-[12.5px] leading-[1.15] font-semibold tracking-[-0.01em] transition-[color,background-color,transform] duration-[120ms] hover:bg-primary hover:text-primary-foreground motion-safe:hover:translate-x-[3px] ' +
                                (active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-foreground')
                            }
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-[24px] h-px bg-foreground" />

            <Link
                href={home()}
                onClick={onNavigate}
                className="mt-[16px] bo-label transition-colors duration-[120ms] hover:text-primary"
            >
                ← Volver al portal
            </Link>
        </div>
    );
}
