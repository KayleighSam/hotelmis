import React, { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import AdminNav from "./AdminNav";

const POS = () => {
  const { products, createSale, loading, error } = useInventory();

  const [customerName, setCustomerName] = useState("Walk-in");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantity || !price) {
      alert("Select product, quantity and price");
      return;
    }

    const payload = {
      customer_name: customerName,
      payment_method: paymentMethod,
      items: [
        {
          product: Number(selectedProduct),
          quantity: Number(quantity),
          price: price, // your API expects string here
        },
      ],
    };

    try {
      await createSale(payload);
      alert("Sale recorded successfully!");
      // reset fields
      setSelectedProduct("");
      setQuantity(1);
      setPrice("");
      setCustomerName("Walk-in");
      setPaymentMethod("cash");
    } catch (err) {
      console.error(err);
      alert("Failed to record sale");
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="container mt-5 pt-4">
        <h2 className="fw-bold">Point of Sale (POS)</h2>

        {loading && <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-3">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              className="form-control"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Payment Method</label>
            <select
              className="form-control"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mpesa">Mpesa</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Product</label>
            <select
              className="form-control"
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                const p = products.find(
                  (prod) => prod.id === Number(e.target.value)
                );
                if (p) setPrice(p.selling_price);
              }}
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.stock_quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Unit Price</label>
            <input
              type="number"
              className="form-control"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Make Sale
          </button>
        </form>

        <div className="mt-5">
          <h4>Available Products</h4>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Selling Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.stock_quantity}</td>
                  <td>{p.selling_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default POS;
