<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Raised when the cargador-facturas microservice rejects an uploaded Excel
 * with a 422 (bad columns on a proposal, or a tampered row on an execution).
 * The message is the upstream `detail` field, safe to show to the user.
 */
class InvoiceLoaderValidationException extends RuntimeException {}
