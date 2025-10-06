import React, { useState, useContext } from "react";
import AdminNav from "./AdminNav"; // your AdminNav component lives in pages
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
  const { register, loading, error } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    second_name: "",
    email: "",
    phone_number: "",
    role: "user",
    password: "",
    profile_image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, val);
    });
    await register(data);
    setShowModal(false);
  };

  return (
    <div>
      <AdminNav />

      <div className="container mt-5 pt-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Admin Dashboard</h2>
          <p className="text-muted">Welcome to the Ores Electron Admin Panel</p>
        </div>

        <div className="row g-4">
          {/* Inventory */}
          <div className="col-md-3">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body text-center">
                <h5 className="card-title">Inventory</h5>
                <p className="card-text">Manage and view all inventory items.</p>
                <a href="/inventory" className="btn btn-primary w-100">
                  Go to Inventory
                </a>
              </div>
            </div>
          </div>
          {/* Stock */}
          <div className="col-md-3">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body text-center">
                <h5 className="card-title">Stock</h5>
                <p className="card-text">Track and update stock levels.</p>
                <a href="/stock" className="btn btn-success w-100">
                  Go to Stock
                </a>
              </div>
            </div>
          </div>
          {/* POS */}
          <div className="col-md-3">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body text-center">
                <h5 className="card-title">POS</h5>
                <p className="card-text">Handle sales and point of service.</p>
                <a href="/pos" className="btn btn-warning w-100">
                  Go to POS
                </a>
              </div>
            </div>
          </div>
          {/* Users */}
          <div className="col-md-3">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body text-center">
                <h5 className="card-title">Users</h5>
                <p className="card-text">View or add new users.</p>
                <button className="btn btn-info w-100" onClick={() => setShowModal(true)}>
                  Manage Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add User</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row g-3">
                  {["username", "first_name", "second_name", "email", "phone_number"].map((field) => (
                    <div className="col-md-6" key={field}>
                      <label className="form-label">{field.replace("_", " ")}</label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        name={field}
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                  ))}
                  <div className="col-md-6">
                    <label className="form-label">Role</label>
                    <select name="role" className="form-select" onChange={handleChange}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-control" onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Profile Image</label>
                    <input type="file" name="profile_image" className="form-control" onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
