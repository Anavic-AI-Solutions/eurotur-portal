<?php

namespace Tests\Feature\Admin\Crm;

use App\Jobs\ArchiveInvoiceLoaderJobStatus;
use App\Models\InvoiceLoaderJob;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InvoiceLoaderHistoryTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
        $this->admin = User::factory()->admin()->create();
    }

    public function test_store_records_a_proposal_job(): void
    {
        Queue::fake();
        Http::fake(['*/proposals' => Http::response(['job_id' => 'job-123'], 202)]);

        $this->actingAs($this->admin)->post(route('admin.crm.invoice-loader.proposals.store'), [
            'file' => UploadedFile::fake()->create('tango.xlsx', 10),
        ]);

        $this->assertDatabaseHas('invoice_loader_jobs', [
            'user_id' => $this->admin->id,
            'job_id' => 'job-123',
            'kind' => 'proposal',
            'original_filename' => 'tango.xlsx',
            'dry_run' => null,
        ]);
    }

    public function test_store_records_an_execution_job_with_its_dry_run_flag(): void
    {
        Queue::fake();
        Http::fake(['*/executions*' => Http::response(['job_id' => 'exec-123'], 202)]);

        $this->actingAs($this->admin)->post(route('admin.crm.invoice-loader.executions.store'), [
            'file' => UploadedFile::fake()->create('propuesta.xlsx', 10),
            'dry_run' => '0',
        ]);

        $this->assertDatabaseHas('invoice_loader_jobs', [
            'user_id' => $this->admin->id,
            'job_id' => 'exec-123',
            'kind' => 'execution',
            'original_filename' => 'propuesta.xlsx',
            'dry_run' => false,
        ]);
    }

    public function test_index_only_shows_the_current_users_jobs(): void
    {
        $other = User::factory()->admin()->create();

        InvoiceLoaderJob::create([
            'user_id' => $this->admin->id,
            'job_id' => 'mine',
            'kind' => 'proposal',
            'original_filename' => 'mio.xlsx',
        ]);

        InvoiceLoaderJob::create([
            'user_id' => $other->id,
            'job_id' => 'not-mine',
            'kind' => 'proposal',
            'original_filename' => 'ajeno.xlsx',
        ]);

        $this->actingAs($this->admin)
            ->get(route('admin.crm.invoice-loader.history.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/crm/invoice-loader/history')
                ->has('jobs.data', 1)
                ->where('jobs.data.0.job_id', 'mine'));
    }

    public function test_downloading_another_users_archived_file_is_forbidden(): void
    {
        $other = User::factory()->admin()->create();
        $job = InvoiceLoaderJob::create([
            'user_id' => $other->id,
            'job_id' => 'ajeno',
            'kind' => 'proposal',
            'original_filename' => 'ajeno.xlsx',
            'file_path' => 'invoice-loader/999/propuesta_carga.xlsx',
            'archived_at' => now(),
        ]);

        $this->actingAs($this->admin)
            ->get(route('admin.crm.invoice-loader.history.file', $job))
            ->assertForbidden();
    }

    public function test_owner_can_download_the_archived_proposal_file(): void
    {
        Storage::fake('local');

        $job = InvoiceLoaderJob::create([
            'user_id' => $this->admin->id,
            'job_id' => 'mine',
            'kind' => 'proposal',
            'original_filename' => 'mio.xlsx',
            'file_path' => 'invoice-loader/1/propuesta_carga.xlsx',
            'archived_at' => now(),
        ]);

        Storage::disk('local')->put($job->file_path, 'contenido-del-excel');

        $this->actingAs($this->admin)
            ->get(route('admin.crm.invoice-loader.history.file', $job))
            ->assertOk();
    }

    public function test_recheck_dispatches_a_fresh_archive_attempt(): void
    {
        Queue::fake();

        $job = InvoiceLoaderJob::create([
            'user_id' => $this->admin->id,
            'job_id' => 'mine',
            'kind' => 'proposal',
            'original_filename' => 'mio.xlsx',
            'polling_attempts' => 400,
        ]);

        $this->actingAs($this->admin)
            ->post(route('admin.crm.invoice-loader.history.recheck', $job))
            ->assertRedirect();

        Queue::assertPushed(ArchiveInvoiceLoaderJobStatus::class);
        $this->assertSame(0, $job->fresh()->polling_attempts);
    }
}
