export type Role = {
    id: number;
    name: string;
    slug: string;
};

export type User = {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
    role?: Role | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    /** Slug of the user's role, or null when they have none. */
    role: string | null;
    /** Every permission slug the user holds; admins get the full catalogue. */
    permissions: string[];
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */
