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
  Alert,
} from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import SearchBooking from "../components/SerchBooking.jsx"; // ✅ fixed import name

function About() {
  const { rooms, fetchPublicRooms, loading, error } = useContext(HotelContext);

  const [showCalendar, setShowCalendar] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [selectedRange, setSelectedRange] = useState([]);
  const [viewMode, setViewMode] = useState("all"); // all | booked | available

  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    check_in: "",
    check_out: "",
  });
  const [amountPaid, setAmountPaid] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState("");
  const [serverError, setServerError] = useState("");

  // 🔹 Fetch rooms when page loads
  useEffect(() => {
    fetchPublicRooms();
  }, []);

  // 🔹 Show room booking calendar
  const handleShowCalendar = async (room) => {
    setSelectedRoom(room);
    setShowCalendar(true);
    setServerError("");
    setViewMode("all");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/hotel/bookings/?room_id=${room.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch booking dates");
      const data = await response.json();

      const ranges = data.map((b) => ({
        start: new Date(b.check_in),
        end: new Date(b.check_out),
      }));
      setBookedRanges(ranges);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Show room details modal
  const handleViewDetails = (room) => {
    setSelectedRoom(room);
    setShowDetails(true);
  };

  // 🔹 Calendar tile visuals
  const tileClassName = ({ date }) => {
    const isBooked = bookedRanges.some(
      (r) => date >= r.start && date <= r.end
    );
    if (viewMode === "booked" && !isBooked) return "hidden-tile";
    if (viewMode === "available" && isBooked) return "hidden-tile";
    return isBooked ? "booked-tile" : "available";
  };

  const tileDisabled = ({ date }) =>
    viewMode !== "booked" &&
    bookedRanges.some((r) => date >= r.start && date <= r.end);

  const tileContent = ({ date }) => {
    const isBooked = bookedRanges.some(
      (r) => date >= r.start && date <= r.end
    );
    if (viewMode === "booked" && !isBooked) return null;
    if (viewMode === "available" && isBooked) return null;
    return isBooked ? (
      <div className="booked-overlay">Booked</div>
    ) : (
      <div className="available-overlay"></div>
    );
  };

  // 🔹 When user selects a date range
  const handleDateChange = (range) => {
    if (Array.isArray(range)) {
      setSelectedRange(range);
      const [start, end] = range;
      if (start && end) {
        setFormData((prev) => ({
          ...prev,
          check_in: start.toISOString().split("T")[0],
          check_out: end.toISOString().split("T")[0],
        }));
        setShowBooking(true);
      }
    }
  };

  // 🔹 Calculate total price dynamically
  useEffect(() => {
    if (formData.check_in && formData.check_out && selectedRoom) {
      const checkIn = new Date(formData.check_in);
      const checkOut = new Date(formData.check_out);
      const totalDays = Math.max(
        1,
        (checkOut - checkIn) / (1000 * 60 * 60 * 24)
      );
      const total = totalDays * selectedRoom.price_per_day;
      setAmountPaid(total);
      setPriceBreakdown(
        `${totalDays} day(s) × Ksh ${selectedRoom.price_per_day} = Ksh ${total}`
      );
    }
  }, [formData.check_in, formData.check_out, selectedRoom]);

  // 🔹 Submit booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!selectedRoom) return alert("No room selected");
    if (!formData.check_in || !formData.check_out)
      return alert("Please select check-in and check-out dates.");

    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    if (checkOut <= checkIn)
      return alert("❌ Check-out date must be after check-in date.");

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
      const resData = await res.json();

      if (!res.ok) {
        console.error("❌ Backend error:", resData);
        setServerError(
          resData.error ||
            resData.non_field_errors?.[0] ||
            "❌ Could not complete booking."
        );
        return;
      }

      alert("✅ Booking successful!");
      setShowBooking(false);
      setShowCalendar(false);
      setSelectedRange([]);
      setFormData({
        client_name: "",
        client_email: "",
        check_in: "",
        check_out: "",
      });
      fetchPublicRooms();
    } catch (err) {
      console.error(err);
      setServerError("⚠️ Network error — please try again later.");
    }
  };

  // 🔹 Loading & Error handling
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

  // ✅ Correctly render SearchBooking component at the top
  return (
    <div className="container mt-4">
      {/* 🔍 Booking Search Section */}
      <div className="mb-5">
        <SearchBooking />
      </div>

      {/* 🏨 Header */}
      <div className="text-center mb-4">
        <h1 className="fw-bold text-primary">Welcome to Milele Hotel</h1>
        <p className="text-muted">
          Discover comfort and elegance — choose your perfect stay below.
        </p>
      </div>

      {/* 🖼️ Featured Carousel */}
      {rooms.length > 0 && (
        <Carousel className="shadow-lg mb-5 rounded-4 overflow-hidden">
          {rooms.slice(0, 4).map((room, i) => (
            <Carousel.Item key={i}>
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

      {/* 🏠 Room Cards */}
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
                  {/* <Badge bg={room.available ? "success" : "danger"}>
                    {room.available ? "Available" : "Booked"}
                  </Badge> */}
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
          <div className="d-flex justify-content-center gap-2 mb-3">
            <Button
              variant={viewMode === "all" ? "primary" : "outline-primary"}
              onClick={() => setViewMode("all")}
            >
              All Dates
            </Button>
            <Button
              variant={viewMode === "available" ? "success" : "outline-success"}
              onClick={() => setViewMode("available")}
            >
              Available Dates
            </Button>
            <Button
              variant={viewMode === "booked" ? "danger" : "outline-danger"}
              onClick={() => setViewMode("booked")}
            >
              Booked Dates
            </Button>
          </div>
          <Calendar
            selectRange
            onChange={handleDateChange}
            tileClassName={tileClassName}
            tileContent={tileContent}
            tileDisabled={tileDisabled}
            prev2Label={null}
            next2Label={null}
            className="large-calendar"
          />
        </Modal.Body>
      </Modal>

      {/* 🧾 Booking Modal */}
      <Modal show={showBooking} onHide={() => setShowBooking(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {serverError && <Alert variant="danger">{serverError}</Alert>}
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
              <Form.Control type="date" value={formData.check_in} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Check-out</Form.Label>
              <Form.Control type="date" value={formData.check_out} readOnly />
            </Form.Group>
            {priceBreakdown && (
              <Alert variant="info">
                <strong>Price Breakdown:</strong> {priceBreakdown}
              </Alert>
            )}
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

      {/* 🏠 View More Modal */}
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
          {selectedRoom && (
            <>
              <Carousel
                interval={3000}
                className="mb-3 rounded-3 overflow-hidden"
              >
                {[selectedRoom.image1, selectedRoom.image2, selectedRoom.image3]
                  .filter(Boolean)
                  .map((img, idx) => (
                    <Carousel.Item key={idx}>
                      <img
                        className="d-block w-100"
                        src={
                          img?.startsWith("http")
                            ? img
                            : `http://127.0.0.1:8000${img}`
                        }
                        alt={`Slide ${idx}`}
                        style={{ height: "350px", objectFit: "cover" }}
                      />
                    </Carousel.Item>
                  ))}
              </Carousel>
              <p className="text-muted">{selectedRoom.description}</p>
              <h5 className="fw-bold text-primary">
                Price: Ksh {selectedRoom.price_per_day.toLocaleString()} / day
              </h5>
              <div className="d-grid mt-3">
                <Button
                  variant="outline-primary"
                  onClick={() => handleShowCalendar(selectedRoom)}
                >
                  View Calendar
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default About;
