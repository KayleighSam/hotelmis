import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { login, loading, error } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">Ores Electron</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/inventory">Inventory</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/stock">Stock</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/pos">POS</a>
              </li>
            </ul>

            <div className="d-flex">
              <button
                className="btn btn-outline-light"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#loginOffcanvas"
                aria-controls="loginOffcanvas"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="loginOffcanvas"
        aria-labelledby="loginOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="loginOffcanvasLabel">Login</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="loginEmail" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="loginEmail"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="loginPassword" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="loginPassword"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Navbar;
