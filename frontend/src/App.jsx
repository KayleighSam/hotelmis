// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Footer from "./components/Footer";

import { AuthProvider } from "./context/AuthContext";
import { ApiFetchProvider } from "./context/ApiFetchContext";
import { InventoryProvider } from "./context/InventoryContext";
import { HotelProvider } from "./context/HotelContext";

import AdminDashboard from "./pages/AdminDashboard";
import Inventory from "./pages/Inventory";
import Stock from "./pages/Stock";
import POS from "./pages/POS";

function AppLayout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin") || 
                       location.pathname.startsWith("/inventory") || 
                       location.pathname.startsWith("/stock") || 
                       location.pathname.startsWith("/pos");

  return (
    <div className="d-flex flex-column min-vh-100 overflow-hidden">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow-1 w-100">{children}</main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ApiFetchProvider>
      <Router>
        <AuthProvider>
          <InventoryProvider>
            
            <HotelProvider>
          <AppLayout>
            <Routes>
              {/* Public route */}
                  <Route path="/" element={<Home />} />
                  <Route path="about" element={ <About/>}/>

              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
    
            </Routes>
            </AppLayout>
            

            </HotelProvider>
            </InventoryProvider>
        </AuthProvider>
      </Router>
    </ApiFetchProvider>
  );
}

export default App;
