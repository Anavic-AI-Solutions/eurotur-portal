<?php

namespace App\Enums;

use Illuminate\Support\Str;

enum UserRole: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    case Viewer = 'viewer';

    /**
     * Roles allowed to modify portal content.
     */
    public function canEdit(): bool
    {
        return in_array($this, [self::Admin, self::Editor], true);
    }

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::Editor => 'Editor',
            self::Viewer => 'Visitante',
        };
    }

    /**
     * Normalize an arbitrary input (e.g. from a form) into a valid role.
     */
    public static function fromSlug(string $value): self
    {
        $slug = Str::lower(trim($value));

        return self::tryFrom($slug) ?? self::Viewer;
    }
}
