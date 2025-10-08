import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { HotelContext } from "../context/HotelContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingModal = ({ show, onHide, booking }) => {
  const { addBooking, updateBooking, rooms } = useContext(HotelContext);
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    room: "",
    check_in: "",
    check_out: "",
    amount_paid: "",
  });
  const [priceBreakdown, setPriceBreakdown] = useState("");

  // ✅ Populate fields when editing
  useEffect(() => {
    if (booking) {
      setForm({
        client_name: booking.client_name,
        client_email: booking.client_email,
        room: booking.room?.id || "",
        check_in: booking.check_in,
        check_out: booking.check_out,
        amount_paid: booking.amount_paid,
      });
    } else {
      setForm({
        client_name: "",
        client_email: "",
        room: "",
        check_in: "",
        check_out: "",
        amount_paid: "",
      });
      setPriceBreakdown("");
    }
  }, [booking]);

  // ✅ Auto-calculate total price
  useEffect(() => {
    const selectedRoom = rooms.find((r) => r.id === parseInt(form.room));
    if (!selectedRoom || !form.check_in || !form.check_out) return;

    const checkInDate = new Date(form.check_in);
    const checkOutDate = new Date(form.check_out);
    const days = Math.max(
      1,
      Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
    );

    const total = days * selectedRoom.price_per_day;

    setForm((prev) => ({ ...prev, amount_paid: total }));
    setPriceBreakdown(
      `${days} day(s) × ${selectedRoom.price_per_day} = ${total}`
    );
  }, [form.room, form.check_in, form.check_out, rooms]);

  // ✅ Handle save/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (booking) {
        await updateBooking(booking.id, form);
        toast.success("✅ Booking updated successfully!");
      } else {
        await addBooking(form);
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
      {/* ✅ Toastify Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {booking ? "Update Booking" : "New Booking"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Client Name */}
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

            {/* Email */}
            <Form.Group className="mt-3">
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

            {/* Room */}
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
                    {r.name} — {r.price_per_day} per day
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Check-In */}
            <Form.Group className="mt-3">
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

            {/* Check-Out */}
            <Form.Group className="mt-3">
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

            {/* ✅ Price breakdown */}
            {priceBreakdown && (
              <div className="mt-3 text-success fw-bold text-center">
                💰 {priceBreakdown}
              </div>
            )}

            {/* Amount */}
            <Form.Group className="mt-3">
              <Form.Label>Total Amount (Auto Calculated)</Form.Label>
              <Form.Control type="number" value={form.amount_paid} readOnly />
            </Form.Group>

            {/* Submit */}
            <div className="text-center mt-4">
              <Button type="submit" variant="success">
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
