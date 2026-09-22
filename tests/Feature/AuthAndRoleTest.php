<?php

use App\Enums\Role;
use App\Models\User;

test('guest is redirected to login when accessing admin dashboard', function () {
    $response = $this->get('/admin');
    $response->assertRedirect('/login');
});

test('customer gets 403 forbidden when accessing admin dashboard', function () {
    $customer = User::factory()->create(['role' => Role::CUSTOMER]);

    $response = $this->actingAs($customer)->get('/admin');
    $response->assertStatus(403);
});

test('admin can access admin dashboard', function () {
    $admin = User::factory()->create(['role' => Role::ADMIN]);

    $response = $this->actingAs($admin)->get('/admin');
    $response->assertOk();
});

test('user registration assigns customer role by default', function () {
    $response = $this->post('/register', [
        'name' => 'Budi Baru',
        'email' => 'budibaru@example.com',
        'phone' => '081234567899',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'budibaru@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->role)->toBe(Role::CUSTOMER);
    expect($user->phone)->toBe('081234567899');
});

test('google login route redirects gracefully when unconfigured', function () {
    $response = $this->get(route('auth.google.redirect'));
    $response->assertRedirect('/login');
    $response->assertSessionHas('error');
});
