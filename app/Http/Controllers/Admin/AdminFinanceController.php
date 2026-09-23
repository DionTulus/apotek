<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Models\FinancialTransaction;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminFinanceController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // Base query for totals within date range
        $totalsQuery = FinancialTransaction::whereBetween('transaction_date', [$startDate, $endDate]);

        $totalIncome = (clone $totalsQuery)->where('type', TransactionType::INCOME)->sum('amount');
        $totalExpense = (clone $totalsQuery)->where('type', TransactionType::EXPENSE)->sum('amount');
        $netProfit = $totalIncome - $totalExpense;

        // Query for filtered table list
        $query = FinancialTransaction::with('creator')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->input('type')))
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->input('category')))
            ->when($request->filled('search'), fn ($q) => $q->where('description', 'like', "%{$request->input('search')}%"));

        $transactions = $query->latest('transaction_date')->latest('id')->paginate(20)->withQueryString();

        $categories = array_map(fn ($c) => ['value' => $c->value, 'label' => ucfirst($c->value)], TransactionCategory::cases());
        $types = array_map(fn ($t) => ['value' => $t->value, 'label' => ucfirst($t->value)], TransactionType::cases());

        return Inertia::render('admin/finance/index', [
            'summary' => [
                'total_income'  => (int) $totalIncome,
                'total_expense' => (int) $totalExpense,
                'net_profit'    => (int) $netProfit,
            ],
            'transactions' => $transactions,
            'categories'   => $categories,
            'types'        => $types,
            'filters'      => [
                'start_date' => $startDate,
                'end_date'   => $endDate,
                'type'       => $request->input('type', ''),
                'category'   => $request->input('category', ''),
                'search'     => $request->input('search', ''),
            ],
        ]);
    }

    public function storeExpense(Request $request): RedirectResponse
    {
        $request->validate([
            'category'         => 'required|in:operational,salary,purchase,refund,other',
            'amount'           => 'required|numeric|min:1000',
            'transaction_date' => 'required|date',
            'description'      => 'required|string|max:500',
        ]);

        FinancialTransaction::create([
            'type'             => TransactionType::EXPENSE,
            'category'         => TransactionCategory::from($request->input('category')),
            'amount'           => $request->input('amount'),
            'transaction_date' => $request->input('transaction_date'),
            'description'      => $request->input('description'),
            'created_by'       => $request->user()->id,
        ]);

        return back()->with('success', 'Pengeluaran operasional berhasil dicatat ke jurnal keuangan.');
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $transactions = FinancialTransaction::with('creator')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->input('type')))
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->input('category')))
            ->when($request->filled('search'), fn ($q) => $q->where('description', 'like', "%{$request->input('search')}%"))
            ->orderBy('transaction_date', 'DESC')
            ->get();

        $filename = "laporan-keuangan-{$startDate}-sd-{$endDate}.csv";

        return response()->streamDownload(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal (Rp)', 'Dicatat Oleh']);

            foreach ($transactions as $t) {
                fputcsv($handle, [
                    $t->id,
                    $t->transaction_date ? $t->transaction_date->format('Y-m-d') : '-',
                    strtoupper($t->type->value),
                    strtoupper($t->category->value),
                    $t->description,
                    $t->amount,
                    $t->creator ? $t->creator->name : 'Sistem',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
