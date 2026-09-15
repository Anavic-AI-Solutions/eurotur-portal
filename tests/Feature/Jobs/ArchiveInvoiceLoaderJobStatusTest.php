<?php

namespace Tests\Feature\Jobs;

use App\Jobs\ArchiveInvoiceLoaderJobStatus;
use App\Models\InvoiceLoaderJob;
use App\Models\User;
use App\Services\InvoiceLoaderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArchiveInvoiceLoaderJobStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_archives_a_completed_proposal(): void
    {
        Storage::fake('local');
        Queue::fake();

        $job = $this->createRecord('proposal');

        Http::fake([
            '*/proposals/'.$job->job_id => Http::response([
                'job_id' => $job->job_id,
                'kind' => 'proposal',
                'status' => 'DONE',
                'progress_current' => 5,
                'progress_total' => 5,
                'error' => null,
            ]),
            '*/proposals/'.$job->job_id.'/file' => Http::response('contenido-del-excel', 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]),
        ]);

        (new ArchiveInvoiceLoaderJobStatus($job->id))->handle(app(InvoiceLoaderService::class));

        $job->refresh();
        $this->assertNotNull($job->archived_at);
        $this->assertSame('DONE', $job->status);
        Storage::disk('local')->assertExists($job->file_path);
        $this->assertSame('contenido-del-excel', Storage::disk('local')->get($job->file_path));
        Queue::assertNotPushed(ArchiveInvoiceLoaderJobStatus::class);
    }

    public function test_it_archives_a_completed_executions_report_and_log(): void
    {
        Storage::fake('local');
        Queue::fake();

        $job = $this->createRecord('execution');

        Http::fake([
            '*/executions/'.$job->job_id => Http::response([
                'job_id' => $job->job_id,
                'kind' => 'execution',
                'status' => 'DONE',
                'progress_current' => 1,
                'progress_total' => 1,
                'error' => null,
            ]),
            '*/executions/'.$job->job_id.'/report' => Http::response('reporte'),
            '*/executions/'.$job->job_id.'/log' => Http::response('{"ok":true}'),
        ]);

        (new ArchiveInvoiceLoaderJobStatus($job->id))->handle(app(InvoiceLoaderService::class));

        $job->refresh();
        $this->assertNotNull($job->archived_at);
        Storage::disk('local')->assertExists($job->report_path);
        Storage::disk('local')->assertExists($job->log_path);
    }

    public function test_it_reschedules_itself_while_the_job_is_still_running(): void
    {
        Queue::fake();

        $job = $this->createRecord('proposal');

        Http::fake([
            '*/proposals/'.$job->job_id => Http::response([
                'job_id' => $job->job_id,
                'kind' => 'proposal',
                'status' => 'RUNNING',
                'progress_current' => 1,
                'progress_total' => 10,
                'error' => null,
            ]),
        ]);

        (new ArchiveInvoiceLoaderJobStatus($job->id))->handle(app(InvoiceLoaderService::class));

        $job->refresh();
        $this->assertNull($job->archived_at);
        $this->assertSame('RUNNING', $job->status);
        $this->assertSame(1, $job->polling_attempts);
        Queue::assertPushed(
            ArchiveInvoiceLoaderJobStatus::class,
            fn (ArchiveInvoiceLoaderJobStatus $pushed): bool => $pushed->invoiceLoaderJobId === $job->id,
        );
    }

    public function test_it_gives_up_after_the_maximum_number_of_attempts(): void
    {
        Queue::fake();

        $job = $this->createRecord('proposal', ['polling_attempts' => 499]);

        Http::fake([
            '*/proposals/'.$job->job_id => Http::response(null, 404),
        ]);

        (new ArchiveInvoiceLoaderJobStatus($job->id))->handle(app(InvoiceLoaderService::class));

        $job->refresh();
        $this->assertSame(500, $job->polling_attempts);
        $this->assertNull($job->archived_at);
        Queue::assertNotPushed(ArchiveInvoiceLoaderJobStatus::class);
    }

    public function test_it_does_not_archive_a_job_that_ended_in_error(): void
    {
        Queue::fake();

        $job = $this->createRecord('proposal');

        Http::fake([
            '*/proposals/'.$job->job_id => Http::response([
                'job_id' => $job->job_id,
                'kind' => 'proposal',
                'status' => 'ERROR',
                'progress_current' => 0,
                'progress_total' => 0,
                'error' => 'algo falló',
            ]),
        ]);

        (new ArchiveInvoiceLoaderJobStatus($job->id))->handle(app(InvoiceLoaderService::class));

        $job->refresh();
        $this->assertSame('ERROR', $job->status);
        $this->assertNull($job->archived_at);
        Queue::assertNotPushed(ArchiveInvoiceLoaderJobStatus::class);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function createRecord(string $kind, array $overrides = []): InvoiceLoaderJob
    {
        $user = User::factory()->create();

        return InvoiceLoaderJob::create(array_merge([
            'user_id' => $user->id,
            'job_id' => 'job-'.$kind.'-'.uniqid(),
            'kind' => $kind,
            'original_filename' => 'archivo.xlsx',
        ], $overrides));
    }
}
