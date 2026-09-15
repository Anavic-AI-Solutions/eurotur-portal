<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceLoaderPageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/crm/invoice-loader/index');
    }
}
