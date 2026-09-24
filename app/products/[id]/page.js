"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "../../../components/AuthGuard";
import { getProductById } from "../../../services/products";

function ProductHeader({ onLogout }) {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/products" className="text-xl font-bold">
          Product Admin
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-black" />
        <p className="mt-4 text-gray-600">Loading product...</p>
      </div>
    </main>
  );
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const controller = new AbortController();

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProductById(id, controller.signal);
        setProduct(data);
      } catch (productError) {
        if (
          productError.name === "CanceledError" ||
          productError.name === "AbortError"
        ) {
          return;
        }

        console.error(productError);
        setProduct(null);
        setError("Product not found.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      controller.abort();
    };
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <AuthGuard>
        <LoadingState />
      </AuthGuard>
    );
  }

  if (error || !product) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-gray-100">
          <ProductHeader onLogout={handleLogout} />
          <div className="mx-auto max-w-xl p-6">
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <h1 className="text-2xl font-bold">Product Not Found</h1>
              <p className="mt-2 text-gray-500">
                The product with ID {id} does not exist.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-block rounded-lg bg-black px-5 py-2 text-white"
              >
                Back to Products
              </Link>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  const images = product.images?.length
    ? product.images
    : [product.thumbnail];

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-100 text-gray-950">
        <ProductHeader onLogout={handleLogout} />

        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          <Link
            href="/products"
            className="mb-6 inline-block text-gray-600 hover:text-black"
          >
            Back to Products
          </Link>

          <article className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6">
                <img
                  src={images[0]}
                  alt={product.title}
                  className="h-80 w-full rounded-lg bg-gray-50 object-contain"
                />
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`${product.title} image ${index + 1}`}
                      className="h-20 w-full rounded-lg border object-cover"
                    />
                  ))}
                </div>
              </div>

              <div className="p-6">
                <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm capitalize">
                  {product.category}
                </span>
                <h1 className="mt-4 text-3xl font-bold">{product.title}</h1>
                <p className="mt-4 leading-7 text-gray-600">
                  {product.description}
                </p>
                <p className="mt-6 text-3xl font-bold">${product.price}</p>

                <div className="mt-4 flex gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-semibold">{product.rating}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className="font-semibold">{product.stock}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="font-medium">{product.brand || "N/A"}</p>
                </div>
              </div>
            </div>

            <section className="border-t p-6">
              <h2 className="mb-5 text-2xl font-bold">Reviews</h2>
              {product.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review, index) => (
                    <div key={`${review.reviewerEmail}-${index}`} className="rounded-lg border p-4">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold">{review.reviewerName}</p>
                          <p className="text-sm text-gray-500">
                            {review.reviewerEmail}
                          </p>
                        </div>
                        <span>Rating: {review.rating}</span>
                      </div>
                      <p className="mt-3 text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews available.</p>
              )}
            </section>
          </article>
        </div>
      </main>
    </AuthGuard>
  );
}
