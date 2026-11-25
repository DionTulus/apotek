<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $spellings = [
            'Premisys' => 'Premysis',
            'Premesys' => 'Premysis',
            'Premysys' => 'Premysis',
            'premisys' => 'premysis',
            'premesys' => 'premysis',
            'premysys' => 'premysis',
        ];

        DB::transaction(function () use ($spellings) {
            DB::table('settings')
                ->where(function ($query) use ($spellings) {
                    foreach (array_keys($spellings) as $spelling) {
                        $query->orWhere('value', 'like', '%'.$spelling.'%');
                    }
                })
                ->select('id', 'value')
                ->get()
                ->each(function ($setting) use ($spellings) {
                    if (! is_string($setting->value)) {
                        return;
                    }

                    $value = str_replace(
                        array_keys($spellings),
                        array_values($spellings),
                        $setting->value
                    );

                    DB::table('settings')
                        ->where('id', $setting->id)
                        ->update(['value' => $value, 'updated_at' => now()]);
                });
        });
    }

    public function down(): void
    {
        // Keep the corrected branding when rolling back.
    }
};
