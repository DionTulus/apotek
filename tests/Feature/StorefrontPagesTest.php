<?php

use App\Models\BlogPost;

test('home page can be rendered', function () {
    $response = $this->get('/');
    $response->assertOk();
});

test('about page can be rendered', function () {
    $response = $this->get('/tentang-kami');
    $response->assertOk();
});

test('contact page can be rendered and form can be submitted', function () {
    $response = $this->get('/kontak');
    $response->assertOk();

    $submitResponse = $this->post('/kontak', [
        'name' => 'Pengunjung Test',
        'email' => 'test@example.com',
        'phone' => '08123456789',
        'subject' => 'Tanya Stok',
        'message' => 'Apakah obat Paracetamol ready?',
    ]);

    $submitResponse->assertSessionHas('success');
});

test('faq page can be rendered', function () {
    $response = $this->get('/faq');
    $response->assertOk();
});

test('terms page can be rendered', function () {
    $response = $this->get('/syarat-ketentuan');
    $response->assertOk();
});

test('privacy page can be rendered', function () {
    $response = $this->get('/kebijakan-privasi');
    $response->assertOk();
});

test('testimonials page can be rendered', function () {
    $response = $this->get('/testimoni');
    $response->assertOk();
});

test('blog index and show page can be rendered', function () {
    $post = BlogPost::first();

    $response = $this->get('/blog');
    $response->assertOk();

    if ($post) {
        $detailResponse = $this->get('/blog/' . $post->slug);
        $detailResponse->assertOk();
    }
});

test('promo page can be rendered', function () {
    $response = $this->get('/promo');
    $response->assertOk();
});
