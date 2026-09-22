<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        $posts = BlogPost::published()
            ->with('author')
            ->latest('published_at')
            ->paginate(9);

        return Inertia::render('store/blog/index', [
            'posts' => $posts,
        ]);
    }

    public function show(string $slug): Response
    {
        $post = BlogPost::published()
            ->with('author')
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedPosts = BlogPost::published()
            ->where('id', '!=', $post->id)
            ->latest('published_at')
            ->take(3)
            ->get();

        return Inertia::render('store/blog/show', [
            'post' => $post,
            'relatedPosts' => $relatedPosts,
        ]);
    }
}
