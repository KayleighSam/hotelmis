import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Home() {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate("/about");
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div
        className="bg-dark text-white text-center py-5"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1578683010236-d716f9a3f461')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "60vh",
        }}
      >
        <div className="bg-dark bg-opacity-50 h-100 d-flex flex-column justify-content-center align-items-center">
          <h1 className="display-4 fw-bold mb-3">Welcome to Milele Hotel</h1>
          <p className="lead mb-4">Your home away from home</p>
          <button
            onClick={handleBookNow}
            className="btn btn-primary btn-lg px-4 py-2 shadow"
          >
            Book a Room
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="container my-5">
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            <img
              src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461"
              alt="Milele Hotel"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-6">
            <h2 className="fw-bold mb-3">About Milele Hotel</h2>
            <p>
              Milele Hotel is a premier destination for travelers seeking
              comfort, tranquility, and exceptional hospitality. Conveniently
              located in the heart of the city, we offer a peaceful retreat
              ideal for business travelers, tourists, and families alike.
            </p>
            <p>
              Our hotel provides elegantly designed rooms, modern amenities, and
              personalized services to ensure every stay is memorable. Whether
              you’re here for a short visit or a long vacation, Milele Hotel
              promises a relaxing and unforgettable experience.
            </p>
          </div>
        </div>
      </div>

      {/* Facilities Section */}
      <div className="bg-light py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Our Facilities</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card border-0 shadow h-100">
                <div className="card-body">
                  <i className="bi bi-house-door display-4 text-primary mb-3"></i>
                  <h5 className="card-title">Luxury Rooms</h5>
                  <p className="card-text">
                    Spacious, air-conditioned rooms with premium bedding and
                    city or garden views.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card border-0 shadow h-100">
                <div className="card-body">
                  <i className="bi bi-cup-straw display-4 text-primary mb-3"></i>
                  <h5 className="card-title">Restaurant & Lounge</h5>
                  <p className="card-text">
                    Enjoy delicious local and international cuisines in a cozy
                    and elegant atmosphere.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card border-0 shadow h-100">
                <div className="card-body">
                  <i className="bi bi-wifi display-4 text-primary mb-3"></i>
                  <h5 className="card-title">Free Wi-Fi</h5>
                  <p className="card-text">
                    Stay connected with high-speed internet available throughout
                    the hotel premises.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission and Vision Section */}
      <div className="container py-5">
        <div className="row text-center">
          <div className="col-md-6 mb-4">
            <h3 className="fw-bold">Our Mission</h3>
            <p>
              To provide exceptional hospitality experiences that make every
              guest feel valued, comfortable, and inspired.
            </p>
          </div>
          <div className="col-md-6 mb-4">
            <h3 className="fw-bold">Our Vision</h3>
            <p>
              To be recognized as the most welcoming and trusted hotel brand
              known for quality service and unforgettable stays.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-dark text-white py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Get in Touch</h2>
          <p className="mb-2">📍 123 Milele Avenue, Nairobi, Kenya</p>
          <p className="mb-2">📞 +254 70000</p>
          <p>✉️ info@milelehotel.com</p>
        </div>
      </div>
    </>
  );
}

export default Home;
