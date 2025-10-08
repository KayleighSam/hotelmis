import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const RoomTable = ({ rooms = [], onEdit, onDelete, onAdd, onExport, onRefresh }) => {
  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">All Rooms</h4>
        <div>
          <Button variant="outline-primary" className="me-2" onClick={onAdd}>
            Add Room
          </Button>
          <Button variant="outline-danger" className="me-2" onClick={onExport}>
            Export PDF
          </Button>
          <Button variant="outline-secondary" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      <Table bordered hover responsive className="shadow-sm rounded-4">
        <thead className="table-primary">
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Name</th>
            <th>Price/Day</th>
            <th>Status</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rooms.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                No rooms available
              </td>
            </tr>
          ) : (
            rooms.map((room, i) => (
              <tr key={room.id}>
                <td>{i + 1}</td>
                <td>
                  <img
                    src={
                      room.image1?.startsWith("http")
                        ? room.image1
                        : `http://127.0.0.1:8000${room.image1}`
                    }
                    alt={room.name}
                    style={{
                      width: "80px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </td>
                <td>{room.name}</td>
                <td>Ksh {Number(room.price_per_day).toLocaleString()}</td>
                <td>
                  <Badge bg={room.available ? "success" : "danger"}>
                    {room.available ? "Available" : "Booked"}
                  </Badge>
                </td>
                <td className="text-truncate" style={{ maxWidth: "250px" }}>
                  {room.description}
                </td>
                <td>
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(room)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(room.id)}
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

export default RoomTable;
