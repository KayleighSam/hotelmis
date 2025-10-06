import React, { useContext, useEffect, useState } from "react";
import { HotelContext } from "../context/HotelContext";
import {
  Carousel,
  Card,
  Button,
  Spinner,
  Badge,
  Modal,
  Form,
} from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
  const { rooms, fetchPublicRooms, loading, error } = useContext(HotelContext);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    check_in: "",
    check_out: "",
  });
  const [amountPaid, setAmountPaid] = useState(0);

  useEffect(() => {
    fetchPublicRooms();
  }, []);

  // 🧭 Fetch bookings for selected room
  const handleShowCalendar = async (room) => {
    setSelectedRoom(room);
    setShowCalendar(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/hotel/bookings/?room_id=${room.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch booking dates");
      const data = await response.json();

      const booked = [];
      data.forEach((booking) => {
        const start = new Date(booking.check_in);
        const end = new Date(booking.check_out);
        for (
          let date = new Date(start);
          date <= end;
          date.setDate(date.getDate() + 1)
        ) {
          booked.push(new Date(date));
        }
      });
      setBookedDates(booked);
    } catch (err) {
      console.error(err);
    }
  };

  // 🖼️ View Room Details
  const handleViewDetails = (room) => {
    setSelectedRoom(room);
    setShowDetails(true);
  };

  // 📅 Style booked days in calendar
  const tileClassName = ({ date }) => {
    const isBooked = bookedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
    return isBooked ? "bg-danger text-white rounded-circle" : "";
  };

  // 📅 Clicking available day opens booking form
  const handleDayClick = (date) => {
    const isBooked = bookedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
    if (!isBooked) {
      const formatted = date.toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        check_in: formatted,
        check_out: formatted,
      }));
      setShowBooking(true);
    }
  };

  // 🧮 Auto-calculate total cost
  useEffect(() => {
    if (formData.check_in && formData.check_out && selectedRoom) {
      const checkIn = new Date(formData.check_in);
      const checkOut = new Date(formData.check_out);
      let totalDays = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
      if (totalDays < 1) totalDays = 1;
      const total = totalDays * selectedRoom.price_per_day;
      setAmountPaid(total);
    }
  }, [formData.check_in, formData.check_out, selectedRoom]);

  // 📤 Submit booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return alert("No room selected");

    const payload = {
      room: selectedRoom.id,
      client_name: formData.client_name,
      client_email: formData.client_email,
      check_in: formData.check_in,
      check_out: formData.check_out,
      amount_paid: amountPaid,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/hotel/bookings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("❌ Backend error:", errData);

        // 🧠 Detect if room unavailable (already booked)
        if (
          errData.error?.includes("booked") ||
          errData.message?.includes("booked") ||
          errData.detail?.includes("booked")
        ) {
          alert("❌ This room is already booked for the selected dates.");
        } else {
          alert("❌ This room is already booked for the selected dates.");
        }
        return;
      }

      alert("✅ Booking successful!");
      setShowBooking(false);
      setShowCalendar(false);
      setFormData({
        client_name: "",
        client_email: "",
        check_in: "",
        check_out: "",
      });
      fetchPublicRooms(); // refresh rooms
    } catch (err) {
      console.error(err);
      alert("⚠️ Could not complete booking. Please check your connection.");
    }
  };

  // 🌀 Loading & Error states
  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-5 text-danger">
        <h5>Error: {error}</h5>
      </div>
    );

  // 🏠 Main UI
  return (
    <div className="container mt-4">
      {/* 🏨 Hero */}
      <div className="text-center mb-4">
        <h1 className="fw-bold text-primary">Welcome to Our Hotel</h1>
        <p className="text-muted">
          Discover comfort, luxury, and style — choose your perfect stay below.
        </p>
      </div>

      {/* 🖼️ Top Carousel */}
      {rooms.length > 0 && (
        <Carousel className="shadow-lg mb-5 rounded-4 overflow-hidden">
          {rooms.slice(0, 4).map((room, index) => (
            <Carousel.Item key={index}>
              <img
                className="d-block w-100"
                src={
                  room.image1?.startsWith("http")
                    ? room.image1
                    : `http://127.0.0.1:8000${room.image1}`
                }
                alt={room.name}
                style={{ height: "450px", objectFit: "cover" }}
              />
              <Carousel.Caption className="bg-dark bg-opacity-50 rounded-3 p-2">
                <h3>{room.name}</h3>
                <p>{room.description?.slice(0, 100)}...</p>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      )}

      {/* 🏠 Room List */}
      <div className="row g-4">
        {rooms.map((room) => (
          <div key={room.id} className="col-md-4 col-lg-3">
            <Card className="shadow-sm border-0 h-100 rounded-4">
              <img
                src={
                  room.image1?.startsWith("http")
                    ? room.image1
                    : `http://127.0.0.1:8000${room.image1}`
                }
                alt={room.name}
                className="card-img-top"
                style={{
                  height: "180px",
                  objectFit: "cover",
                  borderTopLeftRadius: "0.75rem",
                  borderTopRightRadius: "0.75rem",
                }}
              />
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Card.Title className="fs-5">{room.name}</Card.Title>
                  <Badge bg={room.available ? "success" : "danger"}>
                    {room.available ? "Available" : "Booked"}
                  </Badge>
                </div>
                <Card.Text className="text-muted small">
                  {room.description?.slice(0, 80)}...
                </Card.Text>
                <h6 className="text-primary fw-bold mb-3">
                  Ksh {Number(room.price_per_day).toLocaleString()} / day
                </h6>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => handleShowCalendar(room)}
                  >
                    View Calendar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleViewDetails(room)}
                  >
                    View More
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* 🖼️ Room Detail Modal */}
      <Modal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedRoom?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Carousel>
            {[selectedRoom?.image1, selectedRoom?.image2, selectedRoom?.image3]
              .filter(Boolean)
              .map((img, i) => (
                <Carousel.Item key={i}>
                  <img
                    src={
                      img?.startsWith("http") ? img : `http://127.0.0.1:8000${img}`
                    }
                    alt={`${selectedRoom?.name}-${i}`}
                    className="d-block w-100"
                    style={{ height: "400px", objectFit: "cover" }}
                  />
                </Carousel.Item>
              ))}
          </Carousel>
          <div className="mt-3">
            <p>{selectedRoom?.description}</p>
            <h5 className="text-primary">
              Ksh {Number(selectedRoom?.price_per_day).toLocaleString()} / day
            </h5>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => handleShowCalendar(selectedRoom)}
          >
            View Calendar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 📅 Calendar Modal */}
      <Modal
        show={showCalendar}
        onHide={() => setShowCalendar(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedRoom ? `${selectedRoom.name} Availability` : "Calendar"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-center">
            <Calendar
              onClickDay={handleDayClick}
              tileClassName={tileClassName}
              prev2Label={null}
              next2Label={null}
            />
          </div>
          <div className="text-center mt-3">
            <Badge bg="danger" className="me-2">
              Booked
            </Badge>
            <Badge bg="success">Available</Badge>
          </div>
        </Modal.Body>
      </Modal>

      {/* 🧾 Booking Modal */}
      <Modal show={showBooking} onHide={() => setShowBooking(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleBookingSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.client_name}
                onChange={(e) =>
                  setFormData({ ...formData, client_name: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.client_email}
                onChange={(e) =>
                  setFormData({ ...formData, client_email: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Check-in</Form.Label>
              <Form.Control
                type="date"
                value={formData.check_in}
                onChange={(e) =>
                  setFormData({ ...formData, check_in: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Check-out</Form.Label>
              <Form.Control
                type="date"
                value={formData.check_out}
                onChange={(e) =>
                  setFormData({ ...formData, check_out: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Total Amount (Ksh)</Form.Label>
              <Form.Control type="number" value={amountPaid} readOnly />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Confirm Booking
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Home;
