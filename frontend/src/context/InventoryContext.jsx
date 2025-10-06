import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiFetchContext } from "./ApiFetchContext";
import { AuthContext } from "./AuthContext";

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const { post } = useContext(ApiFetchContext);
  const { accessToken } = useContext(AuthContext);

  const baseURL = "http://127.0.0.1:8000/api";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [restocks, setRestocks] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Helper GET with auth */
  const getWithAuth = async (url) => {
    const res = await fetch(`${baseURL}${url}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  /** Helper POST/PUT/DELETE with auth */
  const sendWithAuth = async (url, method = "POST", body = null) => {
    const res = await fetch(`${baseURL}${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  // ====== READ ======
  const fetchCategories = async () => {
    const data = await getWithAuth("/inventory/categories/");
    setCategories(data);
  };
  const fetchProducts = async () => {
    const data = await getWithAuth("/inventory/products/");
    setProducts(data);
  };
  const fetchRestocks = async () => {
    const data = await getWithAuth("/inventory/restocks/");
    setRestocks(data);
  };
  const fetchSales = async () => {
    const data = await getWithAuth("/inventory/sales/");
    setSales(data);
  };

  // ====== CREATE ======
  const createCategory = async (payload) => {
    await sendWithAuth("/inventory/categories/", "POST", payload);
    await fetchCategories();
  };
  const createProduct = async (payload) => {
    await sendWithAuth("/inventory/products/", "POST", payload);
    await fetchProducts();
  };
  const createRestock = async (payload) => {
    await sendWithAuth("/inventory/restocks/", "POST", payload);
    await fetchRestocks();
  };
  const createSale = async (payload) => {
    await sendWithAuth("/inventory/sales/", "POST", payload);
    await fetchSales();
  };

  // ====== UPDATE ======
  const updateCategory = async (id, payload) => {
    await sendWithAuth(`/inventory/categories/${id}/`, "PUT", payload);
    await fetchCategories();
  };
  const updateProduct = async (id, payload) => {
    await sendWithAuth(`/inventory/products/${id}/`, "PUT", payload);
    await fetchProducts();
  };
  const updateRestock = async (id, payload) => {
    await sendWithAuth(`/inventory/restocks/${id}/`, "PUT", payload);
    await fetchRestocks();
  };
  const updateSale = async (id, payload) => {
    await sendWithAuth(`/inventory/sales/${id}/`, "PUT", payload);
    await fetchSales();
  };

  // ====== DELETE ======
  const deleteCategory = async (id) => {
    await sendWithAuth(`/inventory/categories/${id}/`, "DELETE");
    await fetchCategories();
  };
  const deleteProduct = async (id) => {
    await sendWithAuth(`/inventory/products/${id}/`, "DELETE");
    await fetchProducts();
  };
  const deleteRestock = async (id) => {
    await sendWithAuth(`/inventory/restocks/${id}/`, "DELETE");
    await fetchRestocks();
  };
  const deleteSale = async (id) => {
    await sendWithAuth(`/inventory/sales/${id}/`, "DELETE");
    await fetchSales();
  };

  // ====== Auto-load on mount or token change ======
  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    Promise.all([
      fetchCategories(),
      fetchProducts(),
      fetchRestocks(),
      fetchSales(),
    ])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <InventoryContext.Provider
      value={{
        categories,
        products,
        restocks,
        sales,
        loading,
        error,
        fetchCategories,
        fetchProducts,
        fetchRestocks,
        fetchSales,
        createCategory,
        createProduct,
        createRestock,
        createSale,
        updateCategory,
        updateProduct,
        updateRestock,
        updateSale,
        deleteCategory,
        deleteProduct,
        deleteRestock,
        deleteSale,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
