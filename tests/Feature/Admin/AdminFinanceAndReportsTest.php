<?php

namespace Tests\Feature\Admin;

use App\Enums\Role;
use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Models\FinancialTransaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFinanceAndReportsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => Role::ADMIN]);
    }

    public function test_admin_can_view_finance_summary_and_record_expense(): void
    {
        FinancialTransaction::create([
            'type' => TransactionType::INCOME,
            'category' => TransactionCategory::SALES,
            'amount' => 500000,
            'transaction_date' => now()->toDateString(),
            'description' => 'Penjualan harian',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.finance.index'));
        $response->assertOk();

        // Record operational expense
        $expenseResponse = $this->actingAs($this->admin)->post(route('admin.finance.store-expense'), [
            'category' => 'operational',
            'amount' => 150000,
            'transaction_date' => now()->toDateString(),
            'description' => 'Tagihan listrik apotek bulan ini',
        ]);
        $expenseResponse->assertRedirect();

        $this->assertDatabaseHas('financial_transactions', [
            'type' => TransactionType::EXPENSE->value,
            'category' => TransactionCategory::OPERATIONAL->value,
            'amount' => 150000,
        ]);
    }

    public function test_admin_can_export_finance_csv(): void
    {
        FinancialTransaction::create([
            'type' => TransactionType::INCOME,
            'category' => TransactionCategory::SALES,
            'amount' => 750000,
            'transaction_date' => now()->toDateString(),
            'description' => 'Penjualan Obat Reguler',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.finance.export'));
        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_admin_can_view_sales_report_and_export_csv(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.reports.sales'));
        $response->assertOk();

        $exportResponse = $this->actingAs($this->admin)->get(route('admin.reports.sales.export'));
        $exportResponse->assertOk();
        $exportResponse->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_admin_can_view_analytics_dashboard(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.analytics.index'));
        $response->assertOk();
    }
}
