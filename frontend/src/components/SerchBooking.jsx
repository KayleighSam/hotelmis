import React, { useState, useContext } from "react";
import { HotelContext } from "../context/HotelContext";
import {
  Form,
  Button,
  Spinner,
  Table,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { FaSyncAlt, FaArrowLeft, FaSearch } from "react-icons/fa";

const SearchBooking = ({ onGoBack }) => {
  const { searchBookingByEmail, searchResults, loading, error } =
    useContext(HotelContext);
  const [email, setEmail] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    await searchBookingByEmail(email);
  };

  const handleRefresh = () => {
    setEmail("");
    window.location.reload();
  };

  return (
    <div className="container mt-5 p-4 bg-light rounded shadow-lg">
      {/* Header */}
      <Row className="align-items-center mb-4">
        <Col xs="auto">
          <Button
            variant="outline-secondary"
            onClick={onGoBack}
            className="me-2"
            title="Go Back"
          >
            <FaArrowLeft />
          </Button>
        </Col>
        <Col>
          <h4 className="mb-0 text-primary fw-bold text-center">
            🔍 Search Booking by Email
          </h4>
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-success"
            onClick={handleRefresh}
            title="Refresh"
          >
            <FaSyncAlt />
          </Button>
        </Col>
      </Row>

      {/* Search Form */}
      <Form onSubmit={handleSearch} className="mb-3">
        <InputGroup>
          <Form.Control
            type="email"
            placeholder="Enter client email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                <FaSearch className="me-1" /> Search
              </>
            )}
          </Button>
        </InputGroup>
      </Form>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger text-center shadow-sm">{error}</div>
      )}

      {/* Search Results */}
      {!loading && searchResults && searchResults.length > 0 && (
        <div className="mt-4">
          <h5 className="text-success fw-semibold mb-3">
            Results for: <span className="text-dark">{email}</span>
          </h5>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-primary text-center">
                <tr>
                  <th>ID</th>
                  <th>Room</th>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody className="text-center align-middle">
                {searchResults.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.room_name}</td>
                    <td>{b.client_name}</td>
                    <td>{b.client_email}</td>
                    <td>{b.check_in}</td>
                    <td>{b.check_out}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.payment_status === "Paid"
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {b.payment_status}
                      </span>
                    </td>
                    <td>Ksh:{b.amount_paid}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && searchResults?.length === 0 && email && (
        <div className="alert alert-info text-center mt-4">
          No bookings found for <strong>{email}</strong>.
        </div>
      )}
    </div>
  );
};

export default SearchBooking;
