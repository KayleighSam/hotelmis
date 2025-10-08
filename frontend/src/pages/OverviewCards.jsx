import React from "react";
import { Card } from "react-bootstrap";

const OverviewCards = ({ rooms = [], bookings = [], user }) => {
  return (
    <div className="row g-4">
      <div className="col-md-4">
        <Card className="shadow-sm border-0 rounded-4 text-center p-3">
          <Card.Body>
            <h5 className="text-muted">Total Rooms</h5>
            <h2 className="fw-bold text-primary">{rooms.length}</h2>
          </Card.Body>
        </Card>
      </div>

      <div className="col-md-4">
        <Card className="shadow-sm border-0 rounded-4 text-center p-3">
          <Card.Body>
            <h5 className="text-muted">Total Bookings</h5>
            <h2 className="fw-bold text-success">{bookings.length}</h2>
          </Card.Body>
        </Card>
      </div>

      <div className="col-md-4">
        <Card className="shadow-sm border-0 rounded-4 text-center p-3">
          <Card.Body>
            <h5 className="text-muted">Logged in as</h5>
            <h5 className="fw-bold text-dark">{user?.username || "Admin"}</h5>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default OverviewCards;
