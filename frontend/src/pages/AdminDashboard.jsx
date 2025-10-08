import React, { useState, useContext, useEffect } from "react";
import { Button, Alert, Spinner } from "react-bootstrap";
import AdminNav from "./AdminNav";
import { HotelContext } from "../context/HotelContext";
import { AuthContext } from "../context/AuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";

import OverviewCards from "./OverviewCards";
import RoomTable from "./RoomTable";
import BookingTable from "./BookingTable";
import RoomModal from "./RoomModal";
import BookingModal from "./BookingModal";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const {
    rooms,
    bookings,
    fetchAllRooms,
    fetchBookings,
    addRoom,
    deleteRoom,
    deleteBooking,
    updateRoom,
    updateBooking,
    loading,
    error,
  } = useContext(HotelContext);

  const [view, setView] = useState("overview"); // overview | rooms | bookings
  const [localError, setLocalError] = useState("");
  const [roomModalShow, setRoomModalShow] = useState(false);
  const [bookingModalShow, setBookingModalShow] = useState(false);
  const [roomEditMode, setRoomEditMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchAllRooms();
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Export helper
  const handleExportPDF = (type) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(
      `Hotel ${type === "rooms" ? "Rooms" : "Bookings"} Report`,
      14,
      22
    );
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    if (type === "rooms") {
      const tableColumn = [
        "ID",
        "Name",
        "Price/Day",
        "Available",
        "Description",
      ];
      const tableRows = rooms.map((r) => [
        r.id,
        r.name,
        `Ksh ${r.price_per_day}`,
        r.available ? "Yes" : "No",
        r.description,
      ]);
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
      });
    } else {
      const tableColumn = [
        "ID",
        "Client Name",
        "Email",
        "Room",
        "Check-in",
        "Check-out",
        "Amount Paid",
      ];
      const tableRows = bookings.map((b) => [
        b.id,
        b.client_name,
        b.client_email,
        b.room_name || `Room #${b.room}`,
        b.check_in,
        b.check_out,
        `Ksh ${b.amount_paid}`,
      ]);
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
      });
    }

    doc.save(`${type}_report_${Date.now()}.pdf`);
  };

  // Room modal handlers (open for add OR edit)
  const openAddRoomModal = () => {
    setSelectedRoom(null);
    setRoomEditMode(false);
    setRoomModalShow(true);
  };

  const openEditRoomModal = (room) => {
    setSelectedRoom(room);
    setRoomEditMode(true);
    setRoomModalShow(true);
  };

  const handleRoomSaved = async () => {
    // refresh list after add/edit
    await fetchAllRooms();
    setRoomModalShow(false);
  };

  // Booking modal handlers
  const openEditBookingModal = (booking) => {
    setSelectedBooking(booking);
    setBookingModalShow(true);
  };

  const handleBookingUpdated = async () => {
    await fetchBookings();
    setBookingModalShow(false);
  };

  // Delete helpers
  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    await deleteRoom(id);
    await fetchAllRooms();
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    await deleteBooking(id);
    await fetchBookings();
  };

  return (
    <div>
      <AdminNav />

      <div className="container mt-5 pt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary">Admin Dashboard</h2>
          <div>
            <Button
              variant={view === "overview" ? "primary" : "outline-primary"}
              className="me-2"
              onClick={() => setView("overview")}
            >
              Overview
            </Button>
            <Button
              variant={view === "rooms" ? "success" : "outline-success"}
              className="me-2"
              onClick={() => setView("rooms")}
            >
              Rooms
            </Button>
            <Button
              variant={view === "bookings" ? "warning" : "outline-warning"}
              onClick={() => setView("bookings")}
            >
              Bookings
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {localError && <Alert variant="danger">{localError}</Alert>}

        {loading ? (
          <div className="d-flex justify-content-center align-items-center mt-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {view === "overview" && (
              <OverviewCards rooms={rooms} bookings={bookings} user={user} />
            )}

            {view === "rooms" && (
              <RoomTable
                rooms={rooms}
                onEdit={openEditRoomModal}
                onDelete={handleDeleteRoom}
                onAdd={openAddRoomModal}
                onExport={() => handleExportPDF("rooms")}
                onRefresh={fetchAllRooms}
              />
            )}

            {view === "bookings" && (
              <BookingTable
                bookings={bookings}
                onEdit={openEditBookingModal}
                onDelete={handleDeleteBooking}
                onExport={() => handleExportPDF("bookings")}
                onRefresh={fetchBookings}
              />
            )}
          </>
        )}
      </div>

      <RoomModal
        show={roomModalShow}
        onHide={() => setRoomModalShow(false)}
        editMode={roomEditMode}
        room={selectedRoom}
        addRoom={addRoom}
        updateRoom={updateRoom}
        onSaved={handleRoomSaved}
      />

      <BookingModal
        show={bookingModalShow}
        onHide={() => setBookingModalShow(false)}
        booking={selectedBooking}
        updateBooking={updateBooking}
        onUpdated={handleBookingUpdated}
      />
    </div>
  );
};

export default AdminDashboard;
