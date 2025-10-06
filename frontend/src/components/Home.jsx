import React from "react";

const Home = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 w-100 bg-light p-3">
      <div className="card shadow-lg text-center w-100" style={{ maxWidth: "600px" }}>
        <h1 className="display-4 mb-3">Welcome to Ores Electron</h1>
        <p className="lead mb-4">
          Your all-in-one inventory, stock, and POS management system.
        </p>
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <a href="/inventory" className="btn btn-primary">
            View Inventory
          </a>
          <a href="/stock" className="btn btn-success">
            Manage Stock
          </a>
          <a href="/pos" className="btn btn-warning text-white">
            Open POS
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
