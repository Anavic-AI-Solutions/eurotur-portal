<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CrmIndexController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/crm/index');
    }
}
