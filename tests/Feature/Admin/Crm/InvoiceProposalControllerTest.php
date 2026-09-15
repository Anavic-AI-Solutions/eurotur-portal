<?php

namespace Tests\Feature\Admin\Crm;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class InvoiceProposalControllerTest extends TestCase
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

    public function test_store_creates_a_job_and_redirects_to_its_status_page(): void
    {
        Http::fake([
            '*/proposals' => Http::response(['job_id' => 'job-123'], 202),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.crm.invoice-loader.proposals.store'), [
            'file' => UploadedFile::fake()->create('tango.xlsx', 10),
        ]);

        $response->assertRedirect(route('admin.crm.invoice-loader.proposals.show', ['jobId' => 'job-123']));

        Http::assertSent(fn ($request) => $request->hasHeader('X-API-Key') && str_contains((string) $request->url(), '/proposals'));
    }

    public function test_store_surfaces_the_upstream_column_validation_error(): void
    {
        Http::fake([
            '*/proposals' => Http::response(['detail' => "Falta la columna 'Proveedores'"], 422),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.crm.invoice-loader.proposals.store'), [
            'file' => UploadedFile::fake()->create('tango.xlsx', 10),
        ]);

        $response->assertSessionHasErrors('file');
    }

    public function test_store_rejects_files_that_are_not_xlsx(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.crm.invoice-loader.proposals.store'), [
            'file' => UploadedFile::fake()->create('tango.pdf', 10),
        ]);

        $response->assertSessionHasErrors('file');
    }

    public function test_store_flashes_an_error_when_the_microservice_is_unreachable(): void
    {
        Http::fake([
            '*/proposals' => Http::response(null, 500),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.crm.invoice-loader.proposals.store'), [
            'file' => UploadedFile::fake()->create('tango.xlsx', 10),
        ]);

        $response->assertRedirect();
        $response->assertInertiaFlash('toast');
    }

    public function test_show_renders_the_current_status(): void
    {
        Http::fake([
            '*/proposals/job-123' => Http::response([
                'job_id' => 'job-123',
                'kind' => 'proposal',
                'status' => 'RUNNING',
                'progress_current' => 3,
                'progress_total' => 10,
                'error' => null,
            ]),
        ]);

        $this->actingAs($this->admin)
            ->get(route('admin.crm.invoice-loader.proposals.show', ['jobId' => 'job-123']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/crm/invoice-loader/proposal')
                ->where('jobId', 'job-123')
                ->where('status.status', 'RUNNING')
                ->where('status.progress_current', 3));
    }

    public function test_show_redirects_when_the_job_no_longer_exists(): void
    {
        Http::fake([
            '*/proposals/missing-job' => Http::response(null, 404),
        ]);

        $this->actingAs($this->admin)
            ->get(route('admin.crm.invoice-loader.proposals.show', ['jobId' => 'missing-job']))
            ->assertRedirect(route('admin.crm.invoice-loader.index'));
    }

    public function test_download_streams_the_upstream_file_with_its_headers(): void
    {
        Http::fake([
            '*/proposals/job-123/file' => Http::response('binary-xlsx-contents', 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="propuesta_carga.xlsx"',
            ]),
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.crm.invoice-loader.proposals.download', ['jobId' => 'job-123']));

        $response->assertOk();
        $response->assertHeader('Content-Disposition', 'attachment; filename="propuesta_carga.xlsx"');
        $this->assertSame('binary-xlsx-contents', $response->getContent());
    }

    public function test_download_flashes_an_error_when_the_job_is_not_ready(): void
    {
        Http::fake([
            '*/proposals/job-123/file' => Http::response(null, 409),
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.crm.invoice-loader.proposals.download', ['jobId' => 'job-123']));

        $response->assertRedirect(route('admin.crm.invoice-loader.proposals.show', ['jobId' => 'job-123']));
        $response->assertInertiaFlash('toast');
    }
}
