"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategories, getProducts } from "../../services/products";
import {
  getDeletedProductIds,
  getLocalProducts,
} from "../../services/localProducts";

const validLimits = [10, 20, 50];

export default function ProductsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get("search") || "";
  const categoryFromUrl = searchParams.get("category") || "";
  const sortFromUrl = searchParams.get("sort") || "";
  const orderFromUrl = searchParams.get("order") || "asc";
  const rawPage = searchParams.get("page");
  const parsedPage = Number(rawPage);
  const pageFromUrl =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limitFromUrl = Number(searchParams.get("limit")) || 10;
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const skipSearchDebounceRef = useRef(true);

  const limit = validLimits.includes(limitFromUrl) ? limitFromUrl : 10;
  const page = pageFromUrl > 0 ? pageFromUrl : 1;
  const skip = (page - 1) * limit;

  useEffect(() => {
    skipSearchDebounceRef.current = true;
    // The URL is an external source of truth for this controlled input.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const data = await getCategories();
        if (active) {
          setCategories(data);
        }
      } catch (categoryError) {
        console.error(categoryError);
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProducts({
          limit,
          page,
          search: searchFromUrl,
          category: categoryFromUrl,
          sort: sortFromUrl,
          order: orderFromUrl,
          signal: controller.signal,
        });

        const maxPage = Math.max(1, Math.ceil((data.total || 0) / limit));
        if (rawPage !== null && (pageFromUrl !== parsedPage || pageFromUrl > maxPage)) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", String(Math.min(pageFromUrl, maxPage)));
          router.replace(`/products?${params.toString()}`);
          return;
        }

        const localProducts = getLocalProducts();
        const deletedIds = new Set(
          getDeletedProductIds().map((id) => String(id))
        );
        const localById = new Map(
          localProducts.map((product) => [String(product.id), product])
        );
        const serverProducts = (data.products || [])
          .filter((product) => !deletedIds.has(String(product.id)))
          .map((product) => localById.get(String(product.id)) || product);
        const normalizedSearch = searchFromUrl.trim().toLowerCase();
        const localAdditions = localProducts.filter((product) => {
          const isNew = !(data.products || []).some(
            (serverProduct) => String(serverProduct.id) === String(product.id)
          );
          const matchesSearch = !normalizedSearch ||
            [product.title, product.description, product.category]
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch);
          const matchesCategory =
            !categoryFromUrl || product.category === categoryFromUrl;

          return isNew && !deletedIds.has(String(product.id)) && matchesSearch && matchesCategory;
        });
        const mergedProducts =
          page === 1
            ? [...localAdditions, ...serverProducts].slice(0, limit)
            : serverProducts;
        const deletedServerCount = getDeletedProductIds().filter(
          (id) => !localById.has(String(id))
        ).length;

        setProducts(mergedProducts);
        setTotal(
          Math.max(0, (data.total || 0) - deletedServerCount + localAdditions.length)
        );
      } catch (productError) {
        if (
          productError.name === "CanceledError" ||
          productError.name === "AbortError"
        ) {
          return;
        }

        console.error(productError);
        setError("Failed to load products. Please try again.");
        setProducts([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [page, limit, searchFromUrl, categoryFromUrl, sortFromUrl, orderFromUrl, retryCount, rawPage, parsedPage, pageFromUrl, router, searchParams]);

  const updateUrl = useCallback((values) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(values).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products");
  }, [router, searchParams]);

  const handleSearchInput = (event) => {
    setSearchInput(event.target.value);
  };

  useEffect(() => {
    if (skipSearchDebounceRef.current) {
      skipSearchDebounceRef.current = false;
      return undefined;
    }

    const timer = setTimeout(() => {
      updateUrl({
        search: searchInput.trim(),
        category: "",
        page: 1,
      });
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput, updateUrl]);

  const handleCategory = (event) => {
    updateUrl({
      category: event.target.value,
      page: 1,
      search: "",
    });
  };

  const handleSort = (event) => {
    const value = event.target.value;

    if (!value) {
      updateUrl({ sort: "", order: "", page: 1 });
      return;
    }

    const [sortBy, order] = value.split("-");
    updateUrl({ sort: sortBy, order, page: 1 });
  };

  const handleLimit = (event) => {
    updateUrl({ limit: event.target.value, page: 1 });
  };

  const totalPages = Math.ceil(total / limit);
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateUrl({ page: newPage });
    }
  };

  const start = total === 0 ? 0 : skip + 1;
  const end = Math.min(skip + limit, total);
  const sortValue = sortFromUrl ? `${sortFromUrl}-${orderFromUrl}` : "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gray-100 text-gray-950">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold">Product Admin</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <header className="mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-gray-500">Manage your products</p>
          <Link
            href="/products/add"
            className="mt-4 inline-block rounded-lg bg-black px-5 py-2 text-center text-white"
          >
            Add Product
          </Link>
        </header>

        <section className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <label className="sr-only" htmlFor="product-search">
              Search products
            </label>
            <input
              id="product-search"
              type="search"
              placeholder="Search products..."
              value={searchInput}
              onChange={handleSearchInput}
              className="rounded-lg border px-3 py-2"
            />

            <label className="sr-only" htmlFor="category-filter">
              Filter by category
            </label>
            <select
              id="category-filter"
              value={categoryFromUrl}
              onChange={handleCategory}
              className="rounded-lg border px-3 py-2"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="sort-products">
              Sort products
            </label>
            <select
              id="sort-products"
              value={sortValue}
              onChange={handleSort}
              className="rounded-lg border px-3 py-2"
            >
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="title-asc">Title: A-Z</option>
              <option value="title-desc">Title: Z-A</option>
            </select>

            <label className="sr-only" htmlFor="page-size">
              Products per page
            </label>
            <select
              id="page-size"
              value={limit}
              onChange={handleLimit}
              className="rounded-lg border px-3 py-2"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </section>

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-red-100 p-4 text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-xl bg-white p-10 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-black" />
            <p className="mt-4">Loading products...</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm md:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left">Product</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left">Price</th>
                    <th className="p-4 text-left">Rating</th>
                    <th className="p-4 text-left">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <Link
                          href={`/products/${product.id}`}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-12 w-12 rounded object-cover"
                          />
                          <span className="font-medium hover:underline">
                            {product.title}
                          </span>
                        </Link>
                      </td>
                      <td className="p-4 capitalize">{product.category}</td>
                      <td className="p-4">${product.price}</td>
                      <td className="p-4">{product.rating}</td>
                      <td className="p-4">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 md:hidden">
              {products.map((product) => (
                <Link
                  href={`/products/${product.id}`}
                  key={product.id}
                  className="block rounded-xl bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-20 w-20 rounded object-cover"
                    />
                    <div>
                      <h3 className="font-bold">{product.title}</h3>
                      <p className="capitalize text-gray-500">
                        {product.category}
                      </p>
                      <p className="mt-1">${product.price}</p>
                      <p>Rating: {product.rating}</p>
                      <p>Stock: {product.stock}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {!loading && total > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-600">
              Showing {start}-{end} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
                className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`rounded-lg border px-3 py-2 ${
                      pageNumber === page ? "bg-black text-white" : "bg-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => goToPage(page + 1)}
                className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
