import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { HotelContext } from "../context/HotelContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingModal = ({ show, onHide, booking }) => {
  const { createBooking, updateBooking, rooms } = useContext(HotelContext);

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    room: "",
    check_in: "",
    check_out: "",
    adults: 1,
    children: 0,
    meal_plan: "None",
    amount_paid: "",
    total_amount: "",
  });

  const [priceBreakdown, setPriceBreakdown] = useState("");

  // ✅ Populate form for editing
  useEffect(() => {
    if (booking) {
      setForm({
        client_name: booking.client_name || "",
        client_email: booking.client_email || "",
        room: booking.room?.id || booking.room || "",
        check_in: booking.check_in || "",
        check_out: booking.check_out || "",
        adults: booking.adults || 1,
        children: booking.children || 0,
        meal_plan: booking.meal_plan || "None",
        amount_paid: booking.amount_paid || "",
        total_amount: booking.total_amount || "",
      });
    } else {
      setForm({
        client_name: "",
        client_email: "",
        room: "",
        check_in: "",
        check_out: "",
        adults: 1,
        children: 0,
        meal_plan: "None",
        amount_paid: "",
        total_amount: "",
      });
      setPriceBreakdown("");
    }
  }, [booking]);

  // ✅ Auto-calculate total based on room price and stay duration
  useEffect(() => {
    const selectedRoom = rooms.find((r) => r.id === parseInt(form.room));
    if (!selectedRoom || !form.check_in || !form.check_out) return;

    const checkInDate = new Date(form.check_in);
    const checkOutDate = new Date(form.check_out);
    const days = Math.max(
      1,
      Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
    );

    // Base total
    let total = days * selectedRoom.price_per_day;

    // Meal plan extra charge
    if (form.meal_plan === "Half Board") total += 1000 * days;
    if (form.meal_plan === "Full Board") total += 2000 * days;

    setForm((prev) => ({
      ...prev,
      total_amount: total,
      amount_paid: total, // default paid full for simplicity
    }));

    setPriceBreakdown(
      `${days} day(s) × ${selectedRoom.price_per_day} + ${
        form.meal_plan !== "None" ? form.meal_plan : "No meal plan"
      } = Ksh ${total.toLocaleString()}`
    );
  }, [form.room, form.check_in, form.check_out, form.meal_plan, rooms]);

  // ✅ Handle save or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (booking) {
        await updateBooking(booking.id, form);
        toast.success("✅ Booking updated successfully!");
      } else {
        await createBooking(form);
        toast.success("✅ Booking created successfully!");
      }
      onHide();
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to save booking. Please try again.");
    }
  };

  return (
    <>
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Modal show={show} onHide={onHide} centered backdrop="static">
        <Modal.Header closeButton className="bg-warning bg-opacity-25">
          <Modal.Title className="fw-bold">
            {booking ? "✏️ Update Booking" : "🛎️ New Booking"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Client Info */}
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Client Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.client_name}
                    onChange={(e) =>
                      setForm({ ...form, client_name: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.client_email}
                    onChange={(e) =>
                      setForm({ ...form, client_email: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Room Selection */}
            <Form.Group className="mt-3">
              <Form.Label>Room</Form.Label>
              <Form.Select
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                required
              >
                <option value="">-- Select Room --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — Ksh {r.price_per_day.toLocaleString()} / day
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Dates */}
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Check-In</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.check_in}
                    onChange={(e) =>
                      setForm({ ...form, check_in: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Check-Out</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.check_out}
                    onChange={(e) =>
                      setForm({ ...form, check_out: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Guests */}
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Adults</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={form.adults}
                    onChange={(e) =>
                      setForm({ ...form, adults: parseInt(e.target.value) })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Children</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={form.children}
                    onChange={(e) =>
                      setForm({ ...form, children: parseInt(e.target.value) })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Meal Plan */}
            <Form.Group className="mt-3">
              <Form.Label>Meal Plan</Form.Label>
              <Form.Select
                value={form.meal_plan}
                onChange={(e) =>
                  setForm({ ...form, meal_plan: e.target.value })
                }
              >
                <option value="None">None</option>
                <option value="Half Board">Half Board (+Ksh 1,000/day)</option>
                <option value="Full Board">Full Board (+Ksh 2,000/day)</option>
              </Form.Select>
            </Form.Group>

            {/* Price Breakdown */}
            {priceBreakdown && (
              <div className="mt-3 text-center text-success fw-bold">
                💰 {priceBreakdown}
              </div>
            )}

            {/* Totals */}
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Total Amount</Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      form.total_amount
                        ? `Ksh ${Number(form.total_amount).toLocaleString()}`
                        : ""
                    }
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Amount Paid</Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      form.amount_paid
                        ? `Ksh ${Number(form.amount_paid).toLocaleString()}`
                        : ""
                    }
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Submit */}
            <div className="text-center mt-4">
              <Button type="submit" variant="success" className="px-4">
                {booking ? "Update Booking" : "Save Booking"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BookingModal;
