// src/pages/Inventory.jsx
import React, { useEffect, useState } from "react";
import AdminNav from "./AdminNav";
import { useInventory } from "../context/InventoryContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Inventory = () => {
  const {
    categories,
    products,
    restocks,
    sales,
    fetchCategories,
    fetchProducts,
    fetchRestocks,
    fetchSales,
    createCategory,
    createProduct,
    createRestock,
    updateCategory,
    updateProduct,
    updateRestock,
    deleteCategory,
    deleteProduct,
    deleteRestock,
    loading,
    error,
  } = useInventory();

  const [modalType, setModalType] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({});
  const [expandedSale, setExpandedSale] = useState(null); // which sale’s items we’re showing

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchRestocks();
    fetchSales();
  }, []);

  const crud = {
    categories: {
      create: createCategory,
      update: updateCategory,
      delete: deleteCategory,
      data: categories,
    },
    products: {
      create: createProduct,
      update: updateProduct,
      delete: deleteProduct,
      data: products,
    },
    restocks: {
      create: createRestock,
      update: updateRestock,
      delete: deleteRestock,
      data: restocks,
    },
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAdd = async () => {
    if (!modalType || modalType === "sales") return;
    await crud[modalType].create(formData);
    setFormData({});
  };

  const handleEdit = async () => {
    if (!modalType || !selectedId || modalType === "sales") return;
    await crud[modalType].update(selectedId, formData);
    setSelectedId(null);
    setFormData({});
  };

  const handleDelete = async () => {
    if (!modalType || !selectedId || modalType === "sales") return;
    await crud[modalType].delete(selectedId);
    setSelectedId(null);
    setFormData({});
  };

  const renderModalContent = () => {
    if (!modalType) return null;

    // Sales special case
    if (modalType === "sales") {
      return (
        <div className="modal-body">
          <h6 className="mb-3">All Sales</h6>
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <React.Fragment key={sale.id}>
                  <tr
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setExpandedSale(expandedSale === sale.id ? null : sale.id)
                    }
                  >
                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                    <td>{sale.customer_name}</td>
                    <td>{sale.total_amount}</td>
                    <td>{sale.payment_method}</td>
                    <td>
                      {expandedSale === sale.id ? (
                        <span className="text-primary">Hide Items ▲</span>
                      ) : (
                        <span className="text-primary">View Items ▼</span>
                      )}
                    </td>
                  </tr>
                  {expandedSale === sale.id && (
                    <tr>
                      <td colSpan={5}>
                        <table className="table table-sm mb-0">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.items.map((item) => (
                              <tr key={item.id}>
                                <td>{item.product_name}</td>
                                <td>{item.quantity}</td>
                                <td>{item.price}</td>
                                <td>{item.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Non-sales modals
    let data = crud[modalType].data;
    let columns = [];
    let formFields = [];
    switch (modalType) {
      case "categories":
        columns = ["#", "Name", "Description"];
        formFields = [
          { name: "name", placeholder: "Category Name" },
          { name: "description", placeholder: "Description" },
        ];
        break;
      case "products":
        columns = ["#", "Name", "SKU", "Category", "Price", "Stock"];
        formFields = [
          { name: "name", placeholder: "Product Name" },
          { name: "sku", placeholder: "SKU" },
          { name: "category", placeholder: "Category ID" },
          { name: "selling_price", placeholder: "Selling Price" },
          { name: "stock_quantity", placeholder: "Stock Qty" },
        ];
        break;
      case "restocks":
        columns = ["#", "Product", "Qty Added", "Date", "Note"];
        formFields = [
          { name: "product", placeholder: "Product ID" },
          { name: "quantity_added", placeholder: "Quantity Added" },
          { name: "date", placeholder: "Date (YYYY-MM-DD)" },
          { name: "note", placeholder: "Note" },
        ];
        break;
      default:
        return null;
    }

    return (
      <div className="modal-body">
        <div className="mb-3">
          <div className="row g-2">
            {formFields.map((f) => (
              <div className="col-md" key={f.name}>
                <input
                  type="text"
                  name={f.name}
                  className="form-control"
                  placeholder={f.placeholder}
                  value={formData[f.name] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
          <div className="mt-2">
            <button className="btn btn-success btn-sm me-2" onClick={handleAdd}>
              Add New {modalType.slice(0, -1)}
            </button>
            <button
              className="btn btn-secondary btn-sm me-2"
              disabled={!selectedId}
              onClick={handleEdit}
            >
              Update Selected
            </button>
            <button
              className="btn btn-danger btn-sm"
              disabled={!selectedId}
              onClick={handleDelete}
            >
              Delete Selected
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                {columns.map((c, idx) => (
                  <th key={idx}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className={selectedId === item.id ? "table-active" : ""}
                  onClick={() => setSelectedId(item.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{index + 1}</td>
                  {modalType === "categories" && (
                    <>
                      <td>{item.name}</td>
                      <td>{item.description}</td>
                    </>
                  )}
                  {modalType === "products" && (
                    <>
                      <td>{item.name}</td>
                      <td>{item.sku}</td>
                      <td>{item.category_name || "-"}</td>
                      <td>{item.selling_price}</td>
                      <td>{item.stock_quantity}</td>
                    </>
                  )}
                  {modalType === "restocks" && (
                    <>
                      <td>{item.product_name}</td>
                      <td>{item.quantity_added}</td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.note}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Prepare sales chart data
  const salesData = sales.map((s) => ({
    date: new Date(s.date).toLocaleDateString(),
    total: Number(s.total_amount),
  }));

  return (
    <div className="d-flex">
      <AdminNav />
      <div className="container mt-5 pt-5 flex-grow-1">
        <h2 className="fw-bold mb-3">Inventory Dashboard</h2>
        <p className="text-muted">
          Manage Categories, Products, Restocks and view Sales here.
        </p>

        {loading && <div className="alert alert-info">Loading...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-4">
          {["categories", "products", "restocks", "sales"].map((type) => {
            const titles = {
              categories: "Categories",
              products: "Products",
              restocks: "Restocks",
              sales: "Sales",
            };
            const counts = {
              categories: categories.length,
              products: products.length,
              restocks: restocks.length,
              sales: sales.length,
            };
            return (
              <div className="col-md-3" key={type}>
                <div
                  className="card shadow-sm h-100"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setModalType(type);
                    setSelectedId(null);
                    setFormData({});
                  }}
                >
                  <div className="card-body text-center">
                    <h5 className="card-title">{titles[type]}</h5>
                    <p className="display-6">{counts[type]}</p>
                    <small className="text-muted">Manage/View {titles[type]}</small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sales chart */}
        <div className="mt-5">
          <h4>Sales Overview</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal */}
      <div
        className="modal fade show"
        style={{ display: modalType ? "block" : "none" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-capitalize">
                {modalType === "sales" ? "Sales" : `Manage ${modalType}`}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setModalType(null)}
              ></button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      </div>

      {modalType && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setModalType(null)}
        ></div>
      )}
    </div>
  );
};

export default Inventory;
