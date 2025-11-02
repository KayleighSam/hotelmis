import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RoomModal = ({
  show,
  onHide,
  editMode,
  room,
  addRoom,
  updateRoom,
  onSaved,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_per_day: "",
    available: true,
    adults: 1,
    children: 0,
    board_type: "half_board",
    image1: null,
    image2: null,
    image3: null,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editMode && room) {
      setFormData({
        name: room.name || "",
        description: room.description || "",
        price_per_day: room.price_per_day || "",
        available: room.available ?? true,
        adults: room.adults || 1,
        children: room.children || 0,
        board_type: room.board_type || "half_board",
        image1: null,
        image2: null,
        image3: null,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price_per_day: "",
        available: true,
        adults: 1,
        children: 0,
        board_type: "half_board",
        image1: null,
        image2: null,
        image3: null,
      });
    }
  }, [editMode, room, show]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (files) {
      setFormData((p) => ({ ...p, [name]: files[0] }));
    } else if (type === "checkbox") {
      setFormData((p) => ({ ...p, [name]: checked }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== undefined) payload.append(k, v);
      });

      if (editMode && room) {
        await updateRoom(room.id, payload);
        toast.success("✅ Room updated successfully!");
      } else {
        await addRoom(payload);
        toast.success("✅ Room added successfully!");
      }

      onSaved && onSaved();
      onHide();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save room. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Room" : "Add Room"}</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Room Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price per Day (Ksh)</Form.Label>
              <Form.Control
                type="number"
                name="price_per_day"
                value={formData.price_per_day}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Adults
            <Form.Group className="mb-3">
              <Form.Label>Adults</Form.Label>
              <Form.Control
                type="number"
                name="adults"
                min="1"
                value={formData.adults}
                onChange={handleChange}
                required
              />
            </Form.Group> */}

            {/* Children */}
            {/* <Form.Group className="mb-3">
              <Form.Label>Children</Form.Label>
              <Form.Control
                type="number"
                name="children"
                min="0"
                value={formData.children}
                onChange={handleChange}
                required
              />
            </Form.Group> */}

            {/* Board Type */}
            {/* <Form.Group className="mb-3">
              <Form.Label>Board Type</Form.Label>
              <Form.Select
                name="board_type"
                value={formData.board_type}
                onChange={handleChange}
              >
                <option value="half_board">Half Board</option>
                <option value="full_board">Full Board</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Available"
                name="available"
                checked={formData.available}
                onChange={handleChange}
              />
            </Form.Group> */}

            {/* Images */}
            {[1, 2, 3].map((i) => (
              <Form.Group key={i} className="mb-3">
                <Form.Label>{`Image ${i}`}</Form.Label>
                <Form.Control
                  type="file"
                  name={`image${i}`}
                  onChange={handleChange}
                />
              </Form.Group>
            ))}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onHide} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : editMode ? "Update Room" : "Add Room"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default RoomModal;
