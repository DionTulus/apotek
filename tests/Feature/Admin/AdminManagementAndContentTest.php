<?php

namespace Tests\Feature\Admin;

use App\Enums\Role;
use App\Models\BlogPost;
use App\Models\ContactMessage;
use App\Models\Faq;
use App\Models\Promo;
use App\Models\Setting;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminManagementAndContentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => Role::ADMIN]);
    }

    public function test_admin_can_manage_users_and_assign_roles(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.users.index'));
        $response->assertOk();

        // Create new pharmacist user
        $storeResponse = $this->actingAs($this->admin)->post(route('admin.users.store'), [
            'name' => 'Apt. Siti Rahma S.Farm',
            'email' => 'siti.apoteker@example.com',
            'phone' => '081234567990',
            'role' => Role::PHARMACIST->value,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);
        $storeResponse->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', [
            'email' => 'siti.apoteker@example.com',
            'role' => Role::PHARMACIST->value,
        ]);

        $createdUser = User::where('email', 'siti.apoteker@example.com')->first();

        // Update user
        $updateResponse = $this->actingAs($this->admin)->put(route('admin.users.update', $createdUser->id), [
            'name' => 'Apt. Siti Rahma M.Farm',
            'email' => 'siti.apoteker@example.com',
            'phone' => '081234567990',
            'role' => Role::ADMIN->value,
        ]);
        $updateResponse->assertRedirect(route('admin.users.index'));

        $createdUser->refresh();
        $this->assertEquals('Apt. Siti Rahma M.Farm', $createdUser->name);
        $this->assertEquals(Role::ADMIN, $createdUser->role);
    }

    public function test_admin_can_update_website_settings(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.settings.index'));
        $response->assertOk();

        $updateResponse = $this->actingAs($this->admin)->post(route('admin.settings.update'), [
            'site_name' => 'Apotek Mandiri Sehat',
            'site_tagline' => 'Solusi Kesehatan Terpercaya',
            'phone' => '022-7654321',
            'whatsapp' => '081234567890',
            'email' => 'info@apotekmandiri.id',
            'address' => 'Jl Dago No 120 Bandung',
        ]);
        $updateResponse->assertRedirect(route('admin.settings.index'));

        $this->assertEquals('Apotek Mandiri Sehat', Setting::get('site_name'));
        $this->assertEquals('081234567890', Setting::get('whatsapp'));
    }

    public function test_admin_can_manage_faqs(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.content.faqs'));
        $response->assertOk();

        $storeResponse = $this->actingAs($this->admin)->post(route('admin.content.faqs.store'), [
            'question' => 'Bagaimana cara tebus obat keras?',
            'answer' => 'Upload foto resep asli dari dokter saat checkout.',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $storeResponse->assertRedirect();

        $this->assertDatabaseHas('faqs', [
            'question' => 'Bagaimana cara tebus obat keras?',
        ]);

        $faq = Faq::where('question', 'Bagaimana cara tebus obat keras?')->first();

        // Update
        $this->actingAs($this->admin)->put(route('admin.content.faqs.update', $faq->id), [
            'question' => 'Bagaimana cara tebus obat keras dengan resep dokter?',
            'answer' => 'Upload foto resep asli dari dokter saat checkout di aplikasi.',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $faq->refresh();
        $this->assertEquals('Bagaimana cara tebus obat keras dengan resep dokter?', $faq->question);

        // Delete
        $deleteResponse = $this->actingAs($this->admin)->delete(route('admin.content.faqs.destroy', $faq->id));
        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('faqs', ['id' => $faq->id]);
    }

    public function test_admin_can_manage_promos(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.content.promos'));
        $response->assertOk();

        $storeResponse = $this->actingAs($this->admin)->post(route('admin.content.promos.store'), [
            'code' => 'SEHATHEMAT',
            'name' => 'Diskon Sehat Hemat 15%',
            'type' => 'percentage',
            'value' => 15,
            'max_discount' => 20000,
            'min_purchase' => 50000,
            'quota' => 100,
            'starts_at' => now()->toDateString(),
            'ends_at' => now()->addDays(30)->toDateString(),
            'is_active' => true,
        ]);
        $storeResponse->assertRedirect();

        $this->assertDatabaseHas('promos', ['code' => 'SEHATHEMAT']);
    }

    public function test_admin_can_manage_blogs(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.content.blogs'));
        $response->assertOk();

        $storeResponse = $this->actingAs($this->admin)->post(route('admin.content.blogs.store'), [
            'title' => 'Tips Menjaga Imunitas di Musim Hujan',
            'excerpt' => 'Panduan lengkap menjaga daya tahan tubuh.',
            'content' => '<p>Konsumsi vitamin C dan rutin berolahraga.</p>',
            'is_published' => true,
        ]);
        $storeResponse->assertRedirect();

        $this->assertDatabaseHas('blog_posts', [
            'title' => 'Tips Menjaga Imunitas di Musim Hujan',
        ]);
    }

    public function test_admin_can_toggle_testimonial_and_manage_contact_messages(): void
    {
        $testimonial = Testimonial::create([
            'name' => 'Budi Santoso',
            'rating' => 5,
            'content' => 'Pengiriman obat sangat cepat dan rapi!',
            'is_approved' => true,
        ]);

        $toggleResponse = $this->actingAs($this->admin)->post(route('admin.content.testimonials.toggle', $testimonial->id));
        $toggleResponse->assertRedirect();
        $testimonial->refresh();
        $this->assertFalse((bool)$testimonial->is_approved);

        // Contact message
        $message = ContactMessage::create([
            'name' => 'Ahmad',
            'email' => 'ahmad@example.com',
            'phone' => '081234567890',
            'subject' => 'Tanya Ketersediaan Obat',
            'message' => 'Apakah obat amoxicillin sedia di apotek?',
            'is_read' => false,
        ]);

        $msgResponse = $this->actingAs($this->admin)->post(route('admin.content.messages.read', $message->id));
        $msgResponse->assertRedirect();

        $message->refresh();
        $this->assertTrue((bool)$message->is_read);
    }
}
