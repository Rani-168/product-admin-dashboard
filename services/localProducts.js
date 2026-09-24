const readJson = (key) => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export const getLocalProducts = () => readJson("localProducts");

export const saveLocalProducts = (products) => {
  localStorage.setItem("localProducts", JSON.stringify(products));
};

export const upsertLocalProduct = (product) => {
  const products = getLocalProducts();
  const index = products.findIndex(
    (item) => String(item.id) === String(product.id)
  );

  if (index === -1) {
    products.push(product);
  } else {
    products[index] = { ...products[index], ...product };
  }

  saveLocalProducts(products);
  return product;
};

export const getDeletedProductIds = () => readJson("deletedProductIds");

export const saveDeletedProductIds = (ids) => {
  localStorage.setItem("deletedProductIds", JSON.stringify(ids));
};

export const markProductDeleted = (id) => {
  const deletedIds = getDeletedProductIds();
  const normalizedId = String(id);

  if (!deletedIds.some((deletedId) => String(deletedId) === normalizedId)) {
    deletedIds.push(id);
    saveDeletedProductIds(deletedIds);
  }
};
