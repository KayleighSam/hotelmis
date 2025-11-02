import React, { useMemo, useState } from "react";
import { Table, Button, Badge, Row, Col, Card, Form } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const BookingTable = ({ bookings = [], onEdit, onDelete, onExport, onRefresh }) => {
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedRoom, setSelectedRoom] = useState("All");

  // 🧮 Extract years and rooms for dropdown filters
  const availableYears = useMemo(() => {
    const years = new Set();
    bookings.forEach((b) => {
      if (b.check_in) years.add(new Date(b.check_in).getFullYear());
    });
    return ["All", ...Array.from(years).sort((a, b) => b - a)];
  }, [bookings]);

  const availableRooms = useMemo(() => {
    const rooms = new Set();
    bookings.forEach((b) => rooms.add(b.room_name || `Room #${b.room}`));
    return ["All", ...Array.from(rooms)];
  }, [bookings]);

  // 🎯 Filter bookings by year and room
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const year = b.check_in ? new Date(b.check_in).getFullYear() : null;
      const roomName = b.room_name || `Room #${b.room}`;
      const matchYear = selectedYear === "All" || year === parseInt(selectedYear);
      const matchRoom = selectedRoom === "All" || roomName === selectedRoom;
      return matchYear && matchRoom;
    });
  }, [bookings, selectedYear, selectedRoom]);

  // 📊 Count bookings per room
  const bookingsPerRoom = useMemo(() => {
    const roomCount = {};
    filteredBookings.forEach((b) => {
      const roomName = b.room_name || `Room #${b.room}`;
      roomCount[roomName] = (roomCount[roomName] || 0) + 1;
    });
    return Object.entries(roomCount).map(([room, count]) => ({ room, count }));
  }, [filteredBookings]);

  // 🗓️ Count bookings per month
  const bookingsPerMonth = useMemo(() => {
    const monthCount = {};
    filteredBookings.forEach((b) => {
      const date = new Date(b.check_in);
      const month = date.toLocaleString("default", { month: "short" });
      monthCount[month] = (monthCount[month] || 0) + 1;
    });
    return Object.entries(monthCount).map(([month, count]) => ({ month, count }));
  }, [filteredBookings]);

  // 💰 Calculate revenue per room
  const revenuePerRoom = useMemo(() => {
    const roomRevenue = {};
    filteredBookings.forEach((b) => {
      const roomName = b.room_name || `Room #${b.room}`;
      const amount = Number(b.amount_paid || 0);
      roomRevenue[roomName] = (roomRevenue[roomName] || 0) + amount;
    });
    return Object.entries(roomRevenue).map(([room, revenue]) => ({
      room,
      revenue,
    }));
  }, [filteredBookings]);

  // 📈 Monthly revenue trend
  const revenuePerMonth = useMemo(() => {
    const monthRevenue = {};
    filteredBookings.forEach((b) => {
      const date = new Date(b.check_in);
      const month = date.toLocaleString("default", { month: "short" });
      const amount = Number(b.amount_paid || 0);
      monthRevenue[month] = (monthRevenue[month] || 0) + amount;
    });
    return Object.entries(monthRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }, [filteredBookings]);

  const totalBookings = filteredBookings.length;
  const totalRevenue = filteredBookings.reduce(
    (sum, b) => sum + Number(b.amount_paid || 0),
    0
  );

  return (
    <div className="mt-4">
      {/* === Header Section === */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-dark">📘 Booking Dashboard</h4>
        <div>
          <Button variant="outline-danger" className="me-2" onClick={onExport}>
            🧾 Export PDF
          </Button>
          <Button variant="outline-secondary" onClick={onRefresh}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* === Filters === */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="shadow-sm border-0 rounded-4"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y === "All" ? "All Years" : y}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="shadow-sm border-0 rounded-4"
          >
            {availableRooms.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "All Rooms" : r}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* === Summary Cards === */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4 text-center">
            <Card.Body>
              <h6 className="text-secondary fw-semibold">Total Bookings</h6>
              <h2 className="fw-bold text-success">{totalBookings}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4 text-center">
            <Card.Body>
              <h6 className="text-secondary fw-semibold">Total Revenue</h6>
              <h2 className="fw-bold text-primary">
                Ksh {totalRevenue.toLocaleString()}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === Analytics Graphs === */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body>
              <h6 className="fw-semibold text-secondary mb-3">🏨 Bookings per Room</h6>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bookingsPerRoom}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="room" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FFB703" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body>
              <h6 className="fw-semibold text-secondary mb-3">💰 Revenue per Room</h6>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenuePerRoom}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="room" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Ksh ${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#0077B6" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === Monthly Trends === */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body>
              <h6 className="fw-semibold text-secondary mb-3">📅 Monthly Bookings</h6>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={bookingsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#FB8500"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body>
              <h6 className="fw-semibold text-secondary mb-3">📊 Monthly Revenue Trend</h6>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenuePerMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Ksh ${value.toLocaleString()}`} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#219EBC"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === Booking Table === */}
      <h5 className="fw-bold text-dark mb-3">All Bookings</h5>
      <Table bordered hover responsive className="shadow-sm rounded-4">
        <thead className="table-warning text-center">
          <tr>
            <th>#</th>
            <th>Client Name</th>
            <th>Email</th>
            <th>Room</th>
            <th>Adults</th>
            <th>Children</th>
            <th>Meal Plan</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Total Amount</th>
            <th>Amount Paid</th>
            <th>Payment Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody className="align-middle text-center">
          {filteredBookings.length === 0 ? (
            <tr>
              <td colSpan="13" className="text-center text-muted py-4">
                No bookings found 😴
              </td>
            </tr>
          ) : (
            filteredBookings.map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td className="fw-semibold">{b.client_name}</td>
                <td>{b.client_email}</td>
                <td>{b.room_name || `Room #${b.room}`}</td>
                <td>{b.adults || 0}</td>
                <td>{b.children || 0}</td>
                <td>
                  <Badge
                    bg={
                      b.meal_plan === "Full Board"
                        ? "success"
                        : b.meal_plan === "Half Board"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {b.meal_plan || "N/A"}
                  </Badge>
                </td>
                <td>{b.check_in}</td>
                <td>{b.check_out}</td>
                <td>
                  {b.total_amount
                    ? `Ksh ${Number(b.total_amount).toLocaleString()}`
                    : "—"}
                </td>
                <td>
                  {b.amount_paid
                    ? `Ksh ${Number(b.amount_paid).toLocaleString()}`
                    : "—"}
                </td>
                <td>
                  <Badge
                    bg={
                      b.amount_paid === b.total_amount
                        ? "success"
                        : !b.amount_paid
                        ? "secondary"
                        : "danger"
                    }
                  >
                    {b.amount_paid === b.total_amount
                      ? "Paid"
                      : !b.amount_paid
                      ? "Pending"
                      : "Underpaid"}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(b)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(b.id)}
                  >
                    🗑️ Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default BookingTable;
