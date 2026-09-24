"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../../../components/AuthGuard";
import ProductForm from "../../../components/ProductForm";
import { addProduct } from "../../../services/products";
import { upsertLocalProduct } from "../../../services/localProducts";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (product) => {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const createdProduct = await addProduct(product);
      upsertLocalProduct(createdProduct);
      router.push(`/products/${createdProduct.id}`);
    } catch (productError) {
      console.error(productError);
      setError("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-100 text-gray-950">
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <Link href="/products" className="font-bold">
              Product Admin
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-2xl p-4 sm:p-6">
          <Link href="/products" className="text-gray-600 hover:text-black">
            Back to Products
          </Link>
          <h1 className="mb-6 mt-6 text-3xl font-bold">Add Product</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}

          <ProductForm
            onSubmit={handleSubmit}
            loading={loading}
            buttonText="Add Product"
          />
        </div>
      </main>
    </AuthGuard>
  );
}
