import api from "./api";

export const getProducts = async ({
  page = 1,
  limit = 10,
  search = "",
  category = "",
  sort = "",
  order = "asc",
  signal,
}) => {
  const skip = (page - 1) * limit;
  let url = "/products";

  if (search) {
    url = "/products/search";
  } else if (category) {
    url = `/products/category/${encodeURIComponent(category)}`;
  }

  const params = new URLSearchParams();
  params.append("limit", limit);
  params.append("skip", skip);

  if (search) {
    params.append("q", search);
  }

  if (sort) {
    params.append("sortBy", sort);
    params.append("order", order);
  }

  const response = await api.get(`${url}?${params.toString()}`, { signal });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/products/categories");
  return response.data;
};

export const getProductById = async (id, signal) => {
  const response = await api.get(`/products/${id}`, { signal });
  return response.data;
};

export const addProduct = async (product) => {
  const response = await api.post("/products/add", product);
  return response.data;
};

export const updateProduct = async (id, product) => {
  const response = await api.patch(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
