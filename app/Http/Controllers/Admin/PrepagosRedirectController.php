<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class PrepagosRedirectController extends Controller
{
    /**
     * Sends the browser to the externally-hosted Panel de Prepagos.
     */
    public function __invoke(): RedirectResponse
    {
        return redirect()->away(config('services.prepagos.url'));
    }
}
