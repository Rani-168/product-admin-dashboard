"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  category: "",
  stock: "",
};

export default function ProductForm({
  initialData = emptyForm,
  onSubmit,
  loading = false,
  buttonText = "Save Product",
}) {
  const [form, setForm] = useState(initialData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Reset the controlled fields when edit data finishes loading.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(initialData);
    setErrors({});
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required";
    }

    if (form.price === "" || Number(form.price) <= 0) {
      nextErrors.price = "Price must be greater than 0";
    }

    if (!form.category.trim()) {
      nextErrors.category = "Category is required";
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      nextErrors.stock = "Stock cannot be negative";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    });
  };

  const fieldClass = "w-full rounded-lg border px-3 py-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="product-title" className="mb-1 block font-medium">
          Product Title
        </label>
        <input
          id="product-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          className={fieldClass}
          placeholder="Enter product title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="product-description" className="mb-1 block font-medium">
          Description
        </label>
        <textarea
          id="product-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className={fieldClass}
          placeholder="Enter product description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="product-price" className="mb-1 block font-medium">
          Price
        </label>
        <input
          id="product-price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          className={fieldClass}
          placeholder="Enter price"
        />
        {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
      </div>

      <div>
        <label htmlFor="product-category" className="mb-1 block font-medium">
          Category
        </label>
        <input
          id="product-category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className={fieldClass}
          placeholder="Example: smartphones"
        />
        {errors.category && (
          <p className="mt-1 text-sm text-red-500">{errors.category}</p>
        )}
      </div>

      <div>
        <label htmlFor="product-stock" className="mb-1 block font-medium">
          Stock
        </label>
        <input
          id="product-stock"
          name="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={handleChange}
          className={fieldClass}
          placeholder="Enter stock"
        />
        {errors.stock && <p className="mt-1 text-sm text-red-500">{errors.stock}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black py-3 text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : buttonText}
      </button>
    </form>
  );
}
