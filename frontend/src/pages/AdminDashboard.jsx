import React, { useState, useContext, useEffect } from "react";
import { Button, Alert, Spinner, Card } from "react-bootstrap";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AdminNav from "./AdminNav";
import OverviewCards from "./OverviewCards";
import RoomTable from "./RoomTable";
import BookingTable from "./BookingTable";
import RoomModal from "./RoomModal";
import BookingModal from "./BookingModal";
import { HotelContext } from "../context/HotelContext";
import { AuthContext } from "../context/AuthContext";

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

  const [view, setView] = useState("overview");
  const [roomModalShow, setRoomModalShow] = useState(false);
  const [bookingModalShow, setBookingModalShow] = useState(false);
  const [roomEditMode, setRoomEditMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchAllRooms();
    fetchBookings();
  }, []);

  // 📊 Data for Graphs
  const bookingsPerRoom = rooms.map((room) => {
    const totalBookings = bookings.filter((b) => b.room_name === room.name || b.room === room.id).length;
    return { name: room.name, bookings: totalBookings };
  });

  const bookingsPerMonth = bookings.reduce((acc, b) => {
    const month = new Date(b.check_in).toLocaleString("default", { month: "short" });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const monthlyData = Object.keys(bookingsPerMonth).map((month) => ({
    month,
    bookings: bookingsPerMonth[month],
  }));

  // 📄 Export PDF
  const handleExportPDF = (type) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Hotel ${type === "rooms" ? "Rooms" : "Bookings"} Report`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    if (type === "rooms") {
      const tableColumn = ["ID", "Name", "Price/Day", "Adults", "Children", "Board Type", "Available"];
      const tableRows = rooms.map((r) => [
        r.id,
        r.name,
        `Ksh ${r.price_per_day}`,
        r.adults,
        r.children,
        r.board_type,
        r.available ? "Yes" : "No",
      ]);
      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 40 });
    } else {
      const tableColumn = ["ID", "Client Name", "Email", "Room", "Check-in", "Check-out", "Amount Paid"];
      const tableRows = bookings.map((b) => [
        b.id,
        b.client_name,
        b.client_email,
        b.room_name || `Room #${b.room}`,
        b.check_in,
        b.check_out,
        `Ksh ${b.amount_paid}`,
      ]);
      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 40 });
    }

    doc.save(`${type}_report_${Date.now()}.pdf`);
  };

  // 🏠 Room Handlers
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
    await fetchAllRooms();
    setRoomModalShow(false);
  };

  // 🧾 Booking Handlers
  const openEditBookingModal = (booking) => {
    setSelectedBooking(booking);
    setBookingModalShow(true);
  };
  const handleBookingUpdated = async () => {
    await fetchBookings();
    setBookingModalShow(false);
  };
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
        {/* Header Buttons */}
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

        {loading ? (
          <div className="d-flex justify-content-center align-items-center mt-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {/* Overview View with Graphs */}
            {view === "overview" && (
              <>
                <OverviewCards rooms={rooms} bookings={bookings} user={user} />

                {/* 📊 Graphs Section */}
                <div className="row mt-5">
                  {/* Bookings per Room */}
                  <div className="col-md-6 mb-4">
                    <Card className="shadow-sm rounded-4 p-3">
                      <h5 className="text-center fw-bold text-success mb-3">
                        📦 Bookings per Room
                      </h5>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bookingsPerRoom}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="bookings" fill="#28a745" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>

                  {/* Bookings per Month */}
                  <div className="col-md-6 mb-4">
                    <Card className="shadow-sm rounded-4 p-3">
                      <h5 className="text-center fw-bold text-primary mb-3">
                        📅 Monthly Booking Trend
                      </h5>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="bookings"
                            stroke="#007bff"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>
                </div>
              </>
            )}

            {/* Rooms Table */}
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

            {/* Bookings Table */}
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

      {/* Modals */}
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
