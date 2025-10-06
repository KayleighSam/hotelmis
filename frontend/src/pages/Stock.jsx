// src/pages/Stock.jsx
import React from "react";
import AdminNav from "./AdminNav";

const Stock = () => {
  return (
    <div>
      <AdminNav />
      <div className="container mt-5 pt-5">
        <h2 className="fw-bold">Stock</h2>
        <p className="text-muted">Track and update stock levels here.</p>
      </div>
    </div>
  );
};

export default Stock;
