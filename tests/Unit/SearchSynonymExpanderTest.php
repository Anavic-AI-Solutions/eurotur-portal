<?php

namespace Tests\Unit;

use App\Models\SearchSynonymTerm;
use App\Services\SearchSynonymExpander;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchSynonymExpanderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['factura', 'comprobante', 'invoice'] as $term) {
            SearchSynonymTerm::create(['group_number' => 1, 'term' => $term]);
        }

        foreach (['pago', 'cuentas a pagar', 'cxp'] as $term) {
            SearchSynonymTerm::create(['group_number' => 2, 'term' => $term]);
        }
    }

    public function test_it_expands_a_term_to_its_synonym_group(): void
    {
        $expanded = app(SearchSynonymExpander::class)->expand('factura');

        $this->assertContains('factura', $expanded);
        $this->assertContains('comprobante', $expanded);
        $this->assertContains('invoice', $expanded);
    }

    public function test_it_matches_a_multi_word_term_as_a_phrase(): void
    {
        $expanded = app(SearchSynonymExpander::class)->expand('cuentas a pagar');

        $this->assertContains('pago', $expanded);
        $this->assertContains('cxp', $expanded);
    }

    public function test_it_is_accent_and_case_insensitive(): void
    {
        $expanded = app(SearchSynonymExpander::class)->expand('FACTURA');

        $this->assertContains('comprobante', $expanded);
    }

    public function test_a_word_with_no_synonyms_returns_just_itself(): void
    {
        $expanded = app(SearchSynonymExpander::class)->expand('zzzzz');

        $this->assertSame(['zzzzz'], $expanded);
    }

    public function test_it_matches_one_word_within_a_longer_query(): void
    {
        $expanded = app(SearchSynonymExpander::class)->expand('rendicion de gastos factura pendiente');

        $this->assertContains('comprobante', $expanded);
    }
}
