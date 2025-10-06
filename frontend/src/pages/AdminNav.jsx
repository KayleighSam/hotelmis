// src/pages/AdminNav.jsx
import React from "react";
import { Link } from "react-router-dom";

function AdminNav() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/admin">
          Admin Panel
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/admin">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/inventory">
                Inventory
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/stock">
                Stock
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/pos">
                POS
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default AdminNav;
