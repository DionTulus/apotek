<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CrmLeadStatus;
use App\Http\Controllers\Controller;
use App\Models\CrmInteraction;
use App\Models\CrmLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCrmController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CrmLead::with(['user'])
            ->withCount('interactions')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('source'), fn ($q) => $q->where('source', $request->input('source')))
            ->when($request->filled('search'), fn ($q) => $q->where(function ($sub) use ($request) {
                $sub->where('name', 'like', "%{$request->input('search')}%")
                    ->orWhere('phone', 'like', "%{$request->input('search')}%")
                    ->orWhere('email', 'like', "%{$request->input('search')}%");
            }));

        $leads = $query->latest()->paginate(20)->withQueryString();

        $statuses = array_map(fn ($s) => ['value' => $s->value, 'label' => ucfirst($s->value)], CrmLeadStatus::cases());

        $stats = [
            'total'     => CrmLead::count(),
            'new'       => CrmLead::where('status', CrmLeadStatus::NEW)->count(),
            'contacted' => CrmLead::where('status', CrmLeadStatus::CONTACTED)->count(),
            'converted' => CrmLead::where('status', CrmLeadStatus::CONVERTED)->count(),
            'lost'      => CrmLead::where('status', CrmLeadStatus::LOST)->count(),
        ];

        return Inertia::render('admin/crm/index', [
            'leads'    => $leads,
            'statuses' => $statuses,
            'stats'    => $stats,
            'filters'  => $request->only('status', 'source', 'search'),
        ]);
    }

    public function storeLead(Request $request): RedirectResponse
    {
        $request->validate([
            'name'   => 'required|string|max:100',
            'phone'  => 'required|string|max:30',
            'email'  => 'nullable|email|max:100',
            'source' => 'required|string|max:50',
            'note'   => 'nullable|string|max:500',
        ]);

        CrmLead::create([
            'name'   => $request->input('name'),
            'phone'  => $request->input('phone'),
            'email'  => $request->input('email'),
            'source' => $request->input('source'),
            'status' => CrmLeadStatus::NEW,
            'note'   => $request->input('note'),
        ]);

        return back()->with('success', 'Data prospek / lead berhasil ditambahkan.');
    }

    public function show(CrmLead $lead): Response
    {
        $lead->load([
            'user.orders',
            'interactions.creator',
        ]);

        $statuses = array_map(fn ($s) => ['value' => $s->value, 'label' => ucfirst($s->value)], CrmLeadStatus::cases());

        return Inertia::render('admin/crm/show', [
            'lead'     => $lead,
            'statuses' => $statuses,
        ]);
    }

    public function updateLeadStatus(Request $request, CrmLead $lead): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_column(CrmLeadStatus::cases(), 'value')),
        ]);

        $lead->update([
            'status' => CrmLeadStatus::from($request->input('status')),
        ]);

        return back()->with('success', 'Status prospek berhasil diperbarui.');
    }

    public function storeInteraction(Request $request, CrmLead $lead): RedirectResponse
    {
        $request->validate([
            'type'           => 'required|in:whatsapp,phone,email,consultation,meeting,other',
            'summary'        => 'required|string|max:1000',
            'interacted_at'  => 'nullable|date',
        ]);

        CrmInteraction::create([
            'lead_id'        => $lead->id,
            'user_id'        => $lead->user_id,
            'type'           => $request->input('type'),
            'summary'        => $request->input('summary'),
            'interacted_at'  => $request->input('interacted_at', now()),
            'created_by'     => $request->user()->id,
        ]);

        // Automatically change status to contacted if it was new
        if ($lead->status === CrmLeadStatus::NEW) {
            $lead->update(['status' => CrmLeadStatus::CONTACTED]);
        }

        return back()->with('success', 'Catatan interaksi follow-up berhasil disimpan.');
    }
}
