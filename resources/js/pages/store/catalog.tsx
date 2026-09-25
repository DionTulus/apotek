import StoreLayout from '@/layouts/store-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    Heart,
    Pill,
    RefreshCw,
    Search,
    ShieldAlert,
    ShoppingCart,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useState, type MouseEvent } from 'react';

interface ProductItem {
    id: number;
    name: string;
    slug: string;
    price: number;
    cost_price: number;
    unit: string;
    requires_prescription: boolean;
    drug_class: string;
    stock: number;
    image?: string;
    category?: { id: number; name: string; slug: string };
}

interface CategoryOption {
    id: number;
    name: string;
    slug: string;
}

interface DrugClassOption {
    value: string;
    label: string;
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
    categories: CategoryOption[];
    drugClasses: DrugClassOption[];
    userWishlistProductIds: number[];
    filters: {
        q?: string;
        category?: string;
        drug_class?: string;
        requires_prescription?: boolean | string;
        min_price?: string;
        max_price?: string;
        sort?: string;
    };
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
    const safeCategories = categories ?? [];
    const safeDrugClasses = drugClasses ?? [];
    const safeWishlistProductIds = userWishlistProductIds ?? [];
    const safeFilters = filters ?? {};

    const { auth } = usePage<{ auth?: { user?: unknown } }>().props;
    const user = auth?.user;

    const [q, setQ] = useState(safeFilters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(safeFilters.category || '');
    const [selectedDrugClass, setSelectedDrugClass] = useState(safeFilters.drug_class || '');
    const [requiresPrescription, setRequiresPrescription] = useState(
        safeFilters.requires_prescription === true || safeFilters.requires_prescription === 'true'
    );
    const [minPrice, setMinPrice] = useState(safeFilters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(safeFilters.max_price || '');
    const [sortBy, setSortBy] = useState(safeFilters.sort || 'latest');
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const productList = Array.isArray(safeProducts.data) ? safeProducts.data : [];
    const paginationLinks = Array.isArray(safeProducts.links) ? safeProducts.links : [];

    const formatRp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

    const applyFilters = (newParams: Record<string, any> = {}) => {
        const queryParams: Record<string, any> = {
            q: q || undefined,
            category: selectedCategory || undefined,
            drug_class: selectedDrugClass || undefined,
            requires_prescription: requiresPrescription ? 'true' : undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
            sort: sortBy || 'latest',
            ...newParams,
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

            {/* Header Banner */}
            <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Katalog Obat & Alat Kesehatan</h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Temukan obat bebas, obat keras beresep, vitamin, dan suplemen terlengkap di Apotek ERP.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar Filter */}
                    <aside className="hidden lg:block w-64 shrink-0 space-y-6">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-[#8CA9FF]" /> Filter Produk
                                </h3>
                                <button
                                    onClick={handleReset}
                                    className="text-[11px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1"
                                >
                                    <RefreshCw className="w-3 h-3" /> Reset
                                </button>
                            </div>

                            {/* Search */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata Kunci</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari obat, komposisi..."
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                        className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8CA9FF]"
                                    />
                                    <button
                                        onClick={() => applyFilters()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        applyFilters({ category: e.target.value });
                                    }}
                                    className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8CA9FF]"
                                >
                                    <option value="">Semua Kategori</option>
                                    {safeCategories.map((c) => (
                                        <option key={c.id} value={c.slug}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Drug Class Filter */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Golongan Obat</label>
                                <select
                                    value={selectedDrugClass}
                                    onChange={(e) => {
                                        setSelectedDrugClass(e.target.value);
                                        applyFilters({ drug_class: e.target.value });
                                    }}
                                    className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8CA9FF]"
                                >
                                    <option value="">Semua Golongan</option>
                                    {safeDrugClasses.map((dc) => (
                                        <option key={dc.value} value={dc.value}>
                                            {dc.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Requires Prescription */}
                            <div className="pt-2 border-t border-slate-100">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={requiresPrescription}
                                        onChange={(e) => {
                                            setRequiresPrescription(e.target.checked);
                                            applyFilters({ requires_prescription: e.target.checked ? 'true' : undefined });
                                        }}
                                        className="rounded border-slate-300 text-[#8CA9FF] focus:ring-[#8CA9FF]"
                                    />
                                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Butuh Resep Dokter
                                    </span>
                                </label>
                            </div>

                            {/* Price Range */}
                            <div className="pt-2 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Rentang Harga (Rp)</label>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                                    />
                                </div>
                                <button
                                    onClick={() => applyFilters()}
                                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                                >
                                    Terapkan Harga
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Catalog Content */}
                    <div className="flex-1 space-y-6">
                        {/* Top Control Bar */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setMobileFilterOpen(true)}
                                    className="lg:hidden px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5"
                                >
                                    <Filter className="w-4 h-4 text-[#8CA9FF]" /> Filter
                                </button>
                                <span className="text-xs text-slate-500">
                                    Menampilkan <strong className="text-slate-900">{safeProducts.total ?? 0}</strong> produk
                                </span>
                            </div>

                            {/* Sorting */}
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-slate-500 hidden sm:inline">Urutkan:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        applyFilters({ sort: e.target.value });
                                    }}
                                    className="p-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#8CA9FF]"
                                >
                                    <option value="latest">Terbaru</option>
                                    <option value="popular">Terlaris</option>
                                    <option value="price_asc">Harga: Rendah ke Tinggi</option>
                                    <option value="price_desc">Harga: Tinggi ke Rendah</option>
                                    <option value="name_asc">Nama A-Z</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {productList.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#8CA9FF] flex items-center justify-center mx-auto">
                                    <Pill className="w-8 h-8" />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">Tidak ada produk ditemukan</h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Coba ubah kata kunci pencarian atau bersihkan filter yang terpasang.
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="px-5 py-2.5 rounded-full bg-[#8CA9FF] text-white text-xs font-bold hover:bg-blue-500 transition"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                                {productList.map((p) => {
                                    const isWishlisted = safeWishlistProductIds.includes(p.id);

                                    return (
                                        <div
                                            key={p.id}
                                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group relative"
                                        >
                                            {/* Wishlist Button */}
                                            <button
                                                onClick={(e) => handleWishlistToggle(p.id, e)}
                                                className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition ${isWishlisted
                                                        ? 'bg-rose-50 text-rose-500 shadow-sm'
                                                        : 'bg-white/80 text-slate-400 hover:text-rose-500'
                                                    }`}
                                                title={isWishlisted ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
                                            >
                                                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                                            </button>

                                            <div className="p-4 relative">
                                                {/* Prescription Badge */}
                                                {p.requires_prescription && (
                                                    <span className="inline-block px-2 py-0.5 mb-2 rounded-md bg-rose-100 text-rose-700 text-[10px] font-extrabold border border-rose-200">
                                                        Wajib Resep
                                                    </span>
                                                )}

                                                {/* Image Placeholder */}
                                                <Link href={`/produk/${p.slug}`}>
                                                    <div className="w-full h-36 bg-slate-50 rounded-xl flex items-center justify-center my-2 text-slate-400 group-hover:scale-105 transition-transform">
                                                        <Pill className="w-16 h-16 text-[#8CA9FF]/40" />
                                                    </div>
                                                </Link>

                                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                                    {p.category?.name || 'Obat'}
                                                </p>

                                                <Link href={`/produk/${p.slug}`}>
                                                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-blue-600 transition my-1">
                                                        {p.name}
                                                    </h3>
                                                </Link>

                                                <p className="text-[11px] text-slate-500">Per {p.unit}</p>

                                                <div className="mt-2 text-xs">
                                                    {p.stock > 0 ? (
                                                        <span className="text-emerald-600 font-semibold">Stok: {p.stock}</span>
                                                    ) : (
                                                        <span className="text-rose-600 font-semibold">Stok Habis</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block">Harga</span>
                                                    <span className="text-sm sm:text-base font-black text-slate-900">
                                                        {formatRp(p.price)}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={(e) => handleAddToCart(p.id, e)}
                                                    disabled={p.stock <= 0}
                                                    className={`p-2.5 rounded-full text-white shadow-sm transition flex items-center justify-center ${p.stock > 0
                                                            ? 'bg-[#8CA9FF] hover:bg-blue-500'
                                                            : 'bg-slate-300 cursor-not-allowed'
                                                        }`}
                                                    title="Tambah ke Keranjang"
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination Links */}
                        {paginationLinks.length > 3 && (
                            <div className="pt-6 flex justify-center items-center gap-1">
                                {paginationLinks.map((link, idx) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={idx}
                                                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-300 cursor-not-allowed"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveScroll
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${link.active
                                                    ? 'bg-[#8CA9FF] text-white border-[#8CA9FF]'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
                    <div className="w-4/5 max-w-xs bg-white h-full p-5 overflow-y-auto space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-extrabold text-sm text-slate-900">Filter Katalog</h3>
                            <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata Kunci</label>
                            <input
                                type="text"
                                placeholder="Cari obat..."
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                            >
                                <option value="">Semua Kategori</option>
                                {safeCategories.map((c) => (
                                    <option key={c.id} value={c.slug}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Drug Class Filter */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Golongan Obat</label>
                            <select
                                value={selectedDrugClass}
                                onChange={(e) => setSelectedDrugClass(e.target.value)}
                                className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                            >
                                <option value="">Semua Golongan</option>
                                {safeDrugClasses.map((dc) => (
                                    <option key={dc.value} value={dc.value}>
                                        {dc.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Requires Prescription */}
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={requiresPrescription}
                                    onChange={(e) => setRequiresPrescription(e.target.checked)}
                                    className="rounded border-slate-300 text-[#8CA9FF]"
                                />
                                <span className="text-xs font-bold text-slate-700">Wajib Resep Dokter</span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 border-t border-slate-100 space-y-2">
                            <button
                                onClick={() => {
                                    applyFilters();
                                    setMobileFilterOpen(false);
                                }}
                                className="w-full py-2.5 bg-[#8CA9FF] text-white rounded-xl text-xs font-bold shadow"
                            >
                                Terapkan Filter
                            </button>
                            <button
                                onClick={() => {
                                    handleReset();
                                    setMobileFilterOpen(false);
                                }}
                                className="w-full py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StoreLayout>
    );
}
