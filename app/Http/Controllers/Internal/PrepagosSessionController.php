<?php

namespace App\Http\Controllers\Internal;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class PrepagosSessionController extends Controller
{
    /**
     * Called server-to-server by the Panel de Prepagos reverse proxy
     * (nginx `auth_request`), forwarding the browser's own cookie. Responds
     * 200 with the three identity headers the panel trusts, or 401 — never
     * a redirect, since `auth_request` only understands 2xx/401/403.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        abort_unless(
            $user !== null
                && $user->can(Permission::PrepagosManage->value)
                && $user->prepagos_role !== null,
            401,
        );

        return response('', 200, [
            // HTTP header values aren't reliably UTF-8 end-to-end — the
            // panel's Python/Tornado stack decodes headers as Latin-1, so a
            // raw "Peñaloza" arrives mangled ("PeÃ±aloza"). ASCII-fold it
            // instead of coordinating a percent-encoding scheme across repos.
            'X-Portal-Usuario' => Str::ascii($user->name),
            'X-Portal-Rol' => $user->prepagos_role->value,
            'X-Portal-Analista-Codigo' => (string) ($user->prepagos_analista_codigo ?? ''),
        ]);
    }
}
