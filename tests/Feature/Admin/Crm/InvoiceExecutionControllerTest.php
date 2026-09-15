<?php

namespace Tests\Feature\Admin\Crm;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class InvoiceExecutionControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
        $this->admin = User::factory()->admin()->create();

        // These tests only care about the controller's own response — the
        // history-archiving side effect (ArchiveInvoiceLoaderJobStatus) is
        // covered separately, and QUEUE_CONNECTION=sync in tests would
        // otherwise run it inline against unrelated Http::fake() stubs.
        Queue::fake();
    }

    public function test_store_creates_a_dry_run_job_by_default_and_carries_the_flag_to_the_status_page(): void
    {
        Http::fake([
            '*/executions*' => Http::response(['job_id' => 'exec-123'], 202),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.crm.invoice-loader.executions.store'), [
            'file' => UploadedFile::fake()->create('propuesta.xlsx', 10),
        ]);

        $response->assertRedirect(route('admin.crm.invoice-loader.executions.show', [
            'jobId' => 'exec-123',
            'dry_run' => 1,
        ]));

        Http::assertSent(fn ($request) => str_contains((string) $request->url(), 'dry_run=true'));
    }

    public function test_store_can_request_a_real_load(): void
    {
        Http::fake([
            '*/executions*' => Http::response(['job_id' => 'exec-456'], 202),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.crm.invoice-loader.executions.store'), [
            'file' => UploadedFile::fake()->create('propuesta.xlsx', 10),
            'dry_run' => '0',
        ]);

        $response->assertRedirect(route('admin.crm.invoice-loader.executions.show', [
            'jobId' => 'exec-456',
            'dry_run' => 0,
        ]));

        Http::assertSent(fn ($request) => str_contains((string) $request->url(), 'dry_run=false'));
    }

    public function test_store_surfaces_the_upstream_hash_validation_error(): void
    {
        Http::fake([
            '*/executions*' => Http::response(['detail' => 'La fila de Acme SRL fue modificada'], 422),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.crm.invoice-loader.executions.store'), [
            'file' => UploadedFile::fake()->create('propuesta.xlsx', 10),
        ]);

        $response->assertSessionHasErrors('file');
    }

    public function test_show_exposes_status_and_the_dry_run_flag(): void
    {
        Http::fake([
            '*/executions/exec-123' => Http::response([
                'job_id' => 'exec-123',
                'kind' => 'execution',
                'status' => 'DONE',
                'progress_current' => 5,
                'progress_total' => 5,
                'error' => null,
            ]),
        ]);

        $this->actingAs($this->admin)
            ->get(route('admin.crm.invoice-loader.executions.show', ['jobId' => 'exec-123', 'dry_run' => 0]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/crm/invoice-loader/execution')
                ->where('jobId', 'exec-123')
                ->where('status.status', 'DONE')
                ->where('dryRun', false));
    }

    public function test_report_and_log_stream_the_upstream_files(): void
    {
        Http::fake([
            '*/executions/exec-123/report' => Http::response('report-bytes', 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]),
            '*/executions/exec-123/log' => Http::response('{"ok":true}', 200, [
                'Content-Type' => 'application/jsonl',
            ]),
        ]);

        $report = $this->actingAs($this->admin)
            ->get(route('admin.crm.invoice-loader.executions.report', ['jobId' => 'exec-123']));
        $report->assertOk();
        $this->assertSame('report-bytes', $report->getContent());

        $log = $this->actingAs($this->admin)
            ->get(route('admin.crm.invoice-loader.executions.log', ['jobId' => 'exec-123']));
        $log->assertOk();
        $this->assertSame('{"ok":true}', $log->getContent());
    }
}
