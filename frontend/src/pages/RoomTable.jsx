import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const RoomTable = ({
  rooms = [],
  onEdit,
  onDelete,
  onAdd,
  onExport,
  onRefresh,
}) => {
  return (
    <div className="mt-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">All Rooms</h4>
        <div>
          <Button variant="outline-primary" className="me-2" onClick={onAdd}>
            ➕ Add Room
          </Button>
          <Button variant="outline-danger" className="me-2" onClick={onExport}>
            🧾 Export PDF
          </Button>
          <Button variant="outline-secondary" onClick={onRefresh}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <Table bordered hover responsive className="shadow-sm rounded-4">
        <thead className="table-primary text-center">
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Name</th>
            <th>Price/Day</th>
            {/* <th>Adults</th>
            <th>Children</th>
            <th>Meal Plan</th> */}
            {/* <th>Total Amount</th>
            <th>Status</th> */}
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody className="align-middle text-center">
          {rooms.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center text-muted py-4">
                No rooms available 😴
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
                      boxShadow: "0 0 5px rgba(0,0,0,0.15)",
                    }}
                  />
                </td>
                <td className="fw-semibold">{room.name}</td>
                <td>Ksh {Number(room.price_per_day).toLocaleString()}</td>
                {/* <td>{room.adults || 0}</td>
                <td>{room.children || 0}</td>
                <td>
                  <Badge
                    bg={
                      room.meal_plan === "Full Board"
                        ? "success"
                        : room.meal_plan === "Half Board"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {room.meal_plan || "N/A"}
                  </Badge>
                </td> */}
                {/* <td>
                  {room.total_amount
                    ? `Ksh ${Number(room.total_amount).toLocaleString()}`
                    : "—"}
                </td> */}
                {/* <td>
                  <Badge bg={room.available ? "success" : "danger"}>
                    {room.available ? "Available" : "Booked"}
                  </Badge>
                </td> */}
                <td className="text-truncate" style={{ maxWidth: "200px" }}>
                  {room.description}
                </td>
                <td>
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(room)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(room.id)}
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

export default RoomTable;
