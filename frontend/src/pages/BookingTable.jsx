import React from "react";
import { Table, Button } from "react-bootstrap";

const BookingTable = ({ bookings = [], onEdit, onDelete, onExport, onRefresh }) => {
  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">All Bookings</h4>
        <div>
          <Button variant="outline-danger" className="me-2" onClick={onExport}>
            Export PDF
          </Button>
          <Button variant="outline-secondary" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      <Table bordered hover responsive className="shadow-sm rounded-4">
        <thead className="table-warning">
          <tr>
            <th>#</th>
            <th>Client Name</th>
            <th>Email</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Amount Paid</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                No bookings yet
              </td>
            </tr>
          ) : (
            bookings.map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td>{b.client_name}</td>
                <td>{b.client_email}</td>
                <td>{b.room_name || `Room #${b.room}`}</td>
                <td>{b.check_in}</td>
                <td>{b.check_out}</td>
                <td>Ksh {Number(b.amount_paid).toLocaleString()}</td>
                <td>
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(b)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(b.id)}
                  >
                    Delete
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
