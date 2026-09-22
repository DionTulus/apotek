<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('password');
            $table->string('role')->default('customer')->after('phone');
            $table->string('avatar')->nullable()->after('role');
            $table->string('google_id')->nullable()->after('avatar');
            $table->boolean('notify_email')->default(true)->after('google_id');
            $table->boolean('notify_promo')->default(true)->after('notify_email');
            $table->timestamp('last_login_at')->nullable()->after('notify_promo');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'role',
                'avatar',
                'google_id',
                'notify_email',
                'notify_promo',
                'last_login_at',
                'deleted_at',
            ]);
        });
    }
};
