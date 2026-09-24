"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "../../../../components/AuthGuard";
import ProductForm from "../../../../components/ProductForm";
import {
  getProductById,
  updateProduct,
} from "../../../../services/products";
import {
  getDeletedProductIds,
  getLocalProducts,
  upsertLocalProduct,
} from "../../../../services/localProducts";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const controller = new AbortController();

    const loadProduct = async () => {
      try {
        const deletedIds = getDeletedProductIds();
        const localProduct = getLocalProducts().find(
          (item) => String(item.id) === String(id)
        );

        if (deletedIds.some((deletedId) => String(deletedId) === String(id))) {
          setError("Product not found.");
          return;
        }

        if (localProduct) {
          setProduct(localProduct);
          return;
        }

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

  const handleSubmit = async (formData) => {
    if (saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const isLocalProduct = getLocalProducts().some(
        (item) => String(item.id) === String(id)
      );
      let updatedProduct = formData;

      if (!isLocalProduct) {
        updatedProduct = await updateProduct(id, formData);
      }

      upsertLocalProduct({ ...product, ...updatedProduct, id: product.id });
      router.push(`/products/${id}`);
    } catch (updateError) {
      console.error(updateError);
      setError("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const initialData = useMemo(() => {
    if (!product) {
      return undefined;
    }

    return {
      title: product.title || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "",
      stock: product.stock ?? "",
    };
  }, [product]);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-100 text-gray-950">
        <div className="mx-auto max-w-2xl p-4 sm:p-6">
          <Link
            href={`/products/${id}`}
            className="text-gray-600 hover:text-black"
          >
            Back to Product
          </Link>

          <h1 className="mb-6 mt-6 text-3xl font-bold">Edit Product</h1>

          {loading && <p className="rounded-xl bg-white p-6">Loading...</p>}

          {!loading && !product && (
            <div className="rounded-xl bg-white p-6">
              <p>{error || "Product not found."}</p>
            </div>
          )}

          {!loading && product && (
            <>
              {error && (
                <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
                  {error}
                </div>
              )}
              <ProductForm
                initialData={initialData}
                onSubmit={handleSubmit}
                loading={saving}
                buttonText="Update Product"
              />
            </>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
