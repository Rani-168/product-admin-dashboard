export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10 text-gray-950 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 border-b border-gray-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Product Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Product dashboard
            </h1>
          </div>
          <p className="text-sm text-gray-500">Signed in successfully</p>
        </div>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Your catalog is ready</h2>
          <p className="mt-2 max-w-2xl text-gray-600">
            Product management tools will appear here as the dashboard is built.
          </p>
        </section>
      </div>
    </main>
  );
}
