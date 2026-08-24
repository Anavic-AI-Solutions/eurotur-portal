import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            canEdit: boolean;
            sidebarOpen: boolean;
            dolarOficial: {
                venta: number;
                fecha: string | null;
            } | null;
            iataRate: {
                rate: number;
                updatedAt: string | null;
                stale: boolean;
            } | null;
            [key: string]: unknown;
        };
    }
}
