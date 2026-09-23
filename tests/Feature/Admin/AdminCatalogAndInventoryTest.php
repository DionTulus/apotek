<?php

namespace Tests\Feature\Admin;

use App\Enums\DrugClass;
use App\Enums\PurchaseStatus;
use App\Enums\Role;
use App\Enums\StockMovementType;
use App\Enums\TransactionCategory;
use App\Enums\TransactionType;
use App\Models\Category;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCatalogAndInventoryTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => Role::ADMIN]);
        $this->category = Category::create([
            'name' => 'Obat Bebas',
            'slug' => 'obat-bebas',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_view_category_list_and_create_category(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.categories.index'));
        $response->assertOk();

        $postResponse = $this->actingAs($this->admin)->post(route('admin.categories.store'), [
            'name' => 'Vitamin & Suplemen',
            'description' => 'Kategori vitamin dan nutrisi harian',
            'is_active' => true,
        ]);
        $postResponse->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'name' => 'Vitamin & Suplemen',
            'slug' => 'vitamin-suplemen',
        ]);
    }

    public function test_admin_can_create_and_update_product(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.products.store'), [
            'category_id' => $this->category->id,
            'name' => 'Paracetamol 500mg Strip',
            'sku' => 'PCT-500-STP',
            'drug_class' => DrugClass::BEBAS->value,
            'price' => 8500,
            'cost_price' => 5000,
            'unit' => 'Strip',
            'stock' => 50,
            'min_stock' => 10,
            'weight_gram' => 50,
            'requires_prescription' => false,
            'is_active' => true,
            'description' => 'Obat penurun demam dan pereda nyeri',
        ]);
        $response->assertRedirect(route('admin.products.index'));

        $product = Product::where('sku', 'PCT-500-STP')->first();
        $this->assertNotNull($product);
        $this->assertEquals(8500, $product->price);

        // Update product
        $updateResponse = $this->actingAs($this->admin)->put(route('admin.products.update', $product->id), [
            'category_id' => $this->category->id,
            'name' => 'Paracetamol 500mg Forte',
            'sku' => 'PCT-500-STP',
            'drug_class' => DrugClass::BEBAS->value,
            'price' => 9500,
            'cost_price' => 5500,
            'unit' => 'Strip',
            'min_stock' => 12,
            'weight_gram' => 50,
            'requires_prescription' => false,
            'is_active' => true,
        ]);
        $updateResponse->assertRedirect(route('admin.products.index'));

        $product->refresh();
        $this->assertEquals('Paracetamol 500mg Forte', $product->name);
        $this->assertEquals(9500, $product->price);
    }

    public function test_admin_can_adjust_stock_manually(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Amoxicillin 500mg',
            'slug' => 'amoxicillin-500mg',
            'sku' => 'AMX-500',
            'drug_class' => DrugClass::KERAS->value,
            'price' => 15000,
            'cost_price' => 9000,
            'unit' => 'Strip',
            'stock' => 20,
            'min_stock' => 5,
            'weight_gram' => 100,
            'requires_prescription' => true,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.stock.adjust', $product->id), [
            'type' => 'in',
            'qty' => 15,
            'note' => 'Stock opname penambahan barang masuk',
        ]);
        $response->assertRedirect();

        $product->refresh();
        $this->assertEquals(35, $product->stock);

        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'type' => StockMovementType::ADJUSTMENT->value,
            'qty' => 15,
            'stock_after' => 35,
        ]);
    }

    public function test_supplier_purchase_order_completion_increases_stock_and_creates_expense(): void
    {
        $supplier = Supplier::create([
            'name' => 'PT Kimia Farma Trading',
            'contact_person' => 'Bambang',
            'phone' => '081234567800',
            'email' => 'contact@kftd.co.id',
            'address' => 'Jl Pajajaran No 12 Bandung',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Antasida Doen Tablet',
            'slug' => 'antasida-doen-tablet',
            'sku' => 'ATD-001',
            'drug_class' => DrugClass::BEBAS->value,
            'price' => 6000,
            'cost_price' => 3000,
            'unit' => 'Strip',
            'stock' => 10,
            'min_stock' => 5,
            'weight_gram' => 40,
            'requires_prescription' => false,
            'is_active' => true,
        ]);

        $purchase = Purchase::create([
            'purchase_number' => 'PO-' . date('Ymd') . '-001',
            'supplier_id' => $supplier->id,
            'status' => PurchaseStatus::DRAFT,
            'purchase_date' => now()->toDateString(),
            'total' => 150000,
            'created_by' => $this->admin->id,
        ]);

        $purchase->items()->create([
            'product_id' => $product->id,
            'qty' => 50,
            'unit_cost' => 3000,
            'subtotal' => 150000,
            'batch_no' => 'BATCH-ATD-NEW',
            'expiry_date' => now()->addMonths(24)->toDateString(),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.purchases.receive', $purchase->id));
        $response->assertRedirect();

        $purchase->refresh();
        $product->refresh();
        $this->assertEquals(PurchaseStatus::RECEIVED, $purchase->status);
        $this->assertEquals(60, $product->stock); // 10 + 50

        // Financial expense recorded
        $this->assertDatabaseHas('financial_transactions', [
            'type' => TransactionType::EXPENSE->value,
            'category' => TransactionCategory::PURCHASE->value,
            'amount' => 150000,
        ]);
    }
}
