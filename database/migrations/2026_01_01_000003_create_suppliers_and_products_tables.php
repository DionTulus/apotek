<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone');
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('composition')->nullable();
            $table->text('dosage')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('drug_class')->default('bebas'); // Enum: bebas, bebas_terbatas, keras, herbal, suplemen, alkes
            $table->boolean('requires_prescription')->default(false);
            $table->string('unit')->default('pcs'); // strip, botol, box, pcs
            $table->unsignedBigInteger('price');
            $table->unsignedBigInteger('cost_price');
            $table->unsignedInteger('stock')->default(0);
            $table->unsignedInteger('min_stock')->default(10);
            $table->unsignedInteger('weight_gram')->default(100);
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('sold_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['category_id', 'is_active']);
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('suppliers');
    }
};
