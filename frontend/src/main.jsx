// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css"; // <-- Add this
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Optional for JS components (collapse, dropdowns)
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
