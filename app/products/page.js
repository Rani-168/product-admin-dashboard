import { Suspense } from "react";
import AuthGuard from "../../components/AuthGuard";
import ProductsDashboard from "./ProductsDashboard";

function ProductsFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <p className="text-sm text-gray-600">Loading dashboard...</p>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<ProductsFallback />}>
        <ProductsDashboard />
      </Suspense>
    </AuthGuard>
  );
}
