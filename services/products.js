import api from "./api";

export const getProducts = async ({
  limit = 10,
  skip = 0,
  search = "",
  category = "",
  sortBy = "",
  order = "",
  signal,
}) => {
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

  if (sortBy) {
    params.append("sortBy", sortBy);
  }

  if (order) {
    params.append("order", order);
  }

  const response = await api.get(`${url}?${params.toString()}`, { signal });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/products/category-list");
  return response.data;
};

export const getProductById = async (id, signal) => {
  const response = await api.get(`/products/${id}`, { signal });
  return response.data;
};
