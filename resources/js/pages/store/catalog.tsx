import StoreLayout from '@/layouts/store-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ShoppingCart, Heart, Search, Filter, Pill } from 'lucide-react';
import { useState, type MouseEvent } from 'react';

interface ProductItem {
    id: number;
    name: string;
    slug: string;
    price: number;
    unit: string;
    stock: number;
    requires_prescription?: boolean;
    category?: { id: number; name: string; slug: string };
}

interface PaginatedProducts {
    data: ProductItem[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface CatalogProps {
    products: PaginatedProducts;
    categories?: Array<{ id: number; name: string; slug: string }>;
    drugClasses?: Array<{ value: string; label: string }>;
    userWishlistProductIds?: number[];
    filters?: Record<string, unknown> | unknown[];
}

export default function Catalog({
    products,
    categories = [],
    drugClasses = [],
    userWishlistProductIds = [],
    filters,
}: CatalogProps) {
    const safeProducts = products ?? {
        data: [],
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 12,
        links: [],
    };
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeDrugClasses = Array.isArray(drugClasses) ? drugClasses : [];
    const safeWishlistProductIds = Array.isArray(userWishlistProductIds) ? userWishlistProductIds : [];
    const safeFilters = Array.isArray(filters) || filters == null ? {} : filters;

    const { auth } = usePage<{ auth?: { user?: unknown } }>().props;
    const user = auth?.user;

    const [q, setQ] = useState(String((safeFilters as Record<string, unknown>).q ?? ''));
    const [selectedCategory, setSelectedCategory] = useState(String((safeFilters as Record<string, unknown>).category ?? ''));
    const [selectedDrugClass, setSelectedDrugClass] = useState(String((safeFilters as Record<string, unknown>).drug_class ?? ''));
    const [requiresPrescription, setRequiresPrescription] = useState(
        (safeFilters as Record<string, unknown>).requires_prescription === true ||
        (safeFilters as Record<string, unknown>).requires_prescription === 'true'
    );
    const [minPrice, setMinPrice] = useState(String((safeFilters as Record<string, unknown>).min_price ?? ''));
    const [maxPrice, setMaxPrice] = useState(String((safeFilters as Record<string, unknown>).max_price ?? ''));
    const [sortBy, setSortBy] = useState(String((safeFilters as Record<string, unknown>).sort ?? 'latest'));

    const productList = Array.isArray(safeProducts.data) ? safeProducts.data : [];
    const paginationLinks = Array.isArray(safeProducts.links) ? safeProducts.links : [];

    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    const applyFilters = (newParams: Record<string, unknown> = {}) => {
        type CatalogQueryParamValue = string | number | boolean | null | undefined;

        const queryParams: Record<string, CatalogQueryParamValue> = {
            q: q || undefined,
            category: selectedCategory || undefined,
            drug_class: selectedDrugClass || undefined,
            requires_prescription: requiresPrescription ? 'true' : undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
            sort: sortBy || 'latest',
            ...(newParams as Record<string, CatalogQueryParamValue>),
        };

        router.get('/produk', queryParams, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setQ('');
        setSelectedCategory('');
        setSelectedDrugClass('');
        setRequiresPrescription(false);
        setMinPrice('');
        setMaxPrice('');
        setSortBy('latest');
        router.get('/produk', {}, { preserveState: true });
    };

    const handleWishlistToggle = (productId: number, e: MouseEvent) => {
        e.preventDefault();
        if (!user) {
            router.get('/login');
            return;
        }

        router.post(`/wishlist/${productId}`, {}, { preserveScroll: true });
    };

    const handleAddToCart = (productId: number, e: MouseEvent) => {
        e.preventDefault();
        if (!user) {
            router.get('/login');
            return;
        }

        router.post(`/keranjang/add/${productId}`, { qty: 1 }, { preserveScroll: true });
    };

    return (
        <StoreLayout>
            <Head title="Katalog Produk Obat & Kesehatan" />

            <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Katalog Obat & Alat Kesehatan</h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Temukan obat, vitamin, dan kebutuhan kesehatan lengkap untuk Anda.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white p-2 shadow-sm border border-slate-200">
                            <Filter className="h-4 w-4 text-[#8CA9FF]" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Menampilkan</p>
                            <h2 className="text-lg font-bold text-slate-900">{safeProducts.total ?? 0} produk</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-500">Urutkan</label>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                applyFilters({ sort: e.target.value });
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
                        >
                            <option value="latest">Terbaru</option>
                            <option value="popular">Terlaris</option>
                            <option value="price_asc">Harga: Rendah ke Tinggi</option>
                            <option value="price_desc">Harga: Tinggi ke Rendah</option>
                            <option value="name_asc">Nama A-Z</option>
                        </select>
                    </div>
                </div>

                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            placeholder="Cari obat, vitamin, atau kategori..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:border-[#8CA9FF]"
                        />
                    </div>
                    <button
                        onClick={() => applyFilters()}
                        className="rounded-xl bg-[#8CA9FF] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-500"
                    >
                        Cari
                    </button>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {productList.length === 0 ? (
                        <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#8CA9FF]">
                                <Pill className="h-8 w-8" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800">Belum ada produk</h3>
                            <p className="mt-2 text-xs text-slate-500">Coba ubah kata kunci atau reset filter Anda.</p>
                            <button
                                onClick={handleReset}
                                className="mt-4 rounded-full bg-[#8CA9FF] px-4 py-2 text-xs font-bold text-white"
                            >
                                Reset Filter
                            </button>
                        </div>
                    ) : (
                        productList.map((product) => {
                            const isWishlisted = safeWishlistProductIds.includes(product.id);

                            return (
                                <div
                                    key={product.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
                                >
                                    <div className="relative p-4">
                                        <button
                                            type="button"
                                            onClick={(e) => handleWishlistToggle(product.id, e)}
                                            className={`absolute right-3 top-3 rounded-full p-2 backdrop-blur-sm ${
                                                isWishlisted ? 'bg-rose-50 text-rose-500' : 'bg-white text-slate-400 hover:text-rose-500'
                                            }`}
                                            title={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
                                        >
                                            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                                        </button>

                                        <Link href={`/produk/${product.slug}`}>
                                            <div className="mb-4 flex h-36 items-center justify-center rounded-xl bg-slate-50 text-slate-300 transition group-hover:scale-[1.02]">
                                                <Pill className="h-16 w-16 text-[#8CA9FF]/35" />
                                            </div>
                                        </Link>

                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                            {product.category?.name || 'Obat'}
                                        </p>
                                        <Link href={`/produk/${product.slug}`}>
                                            <h3 className="mt-2 line-clamp-2 text-sm font-bold text-slate-900 hover:text-blue-600">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="mt-2 text-[11px] text-slate-500">Per {product.unit}</p>
                                        <div className="mt-3 text-xs">
                                            {product.stock > 0 ? (
                                                <span className="font-semibold text-emerald-600">Stok: {product.stock}</span>
                                            ) : (
                                                <span className="font-semibold text-rose-600">Stok Habis</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4">
                                        <div>
                                            <span className="block text-[10px] text-slate-400">Harga</span>
                                            <span className="text-base font-black text-slate-900">{formatRp(product.price)}</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => handleAddToCart(product.id, e)}
                                            disabled={product.stock <= 0}
                                            className={`rounded-full p-2.5 text-white shadow-sm transition ${
                                                product.stock > 0 ? 'bg-[#8CA9FF] hover:bg-blue-500' : 'cursor-not-allowed bg-slate-300'
                                            }`}
                                            title="Tambah ke keranjang"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {paginationLinks.length > 0 && (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                        {paginationLinks.map((link, index) => {
                            if (!link.url) {
                                return (
                                    <span
                                        key={`${link.label}-${index}`}
                                        className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-300"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url}
                                    preserveScroll
                                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                                        link.active
                                            ? 'border-[#8CA9FF] bg-[#8CA9FF] text-white'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}

