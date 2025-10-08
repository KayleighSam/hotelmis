import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * RoomModal
 *
 * Props:
 * - show (bool)
 * - onHide (fn)
 * - editMode (bool)
 * - room (object|null)
 * - addRoom (fn) -> async expects FormData
 * - updateRoom (fn) -> async expects (roomId, FormData)
 * - onSaved (fn) -> called after successful save
 */
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
    image1: null,
    image2: null,
    image3: null,
  });
  const [saving, setSaving] = useState(false);

  // ✅ Populate modal when editing
  useEffect(() => {
    if (editMode && room) {
      setFormData({
        name: room.name || "",
        description: room.description || "",
        price_per_day: room.price_per_day || "",
        available: room.available ?? true,
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
        image1: null,
        image2: null,
        image3: null,
      });
    }
  }, [editMode, room, show]);

  // ✅ Handle input changes
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

  // ✅ Handle save / update
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
      {/* ✅ Toastify Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Room" : "Add Room"}</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Room Name */}
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

            {/* Description */}
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

            {/* Price per Day */}
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

            {/* Availability */}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Available"
                name="available"
                checked={formData.available}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Images */}
            <Form.Group className="mb-3">
              <Form.Label>Image 1</Form.Label>
              <Form.Control type="file" name="image1" onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image 2</Form.Label>
              <Form.Control type="file" name="image2" onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image 3</Form.Label>
              <Form.Control type="file" name="image3" onChange={handleChange} />
            </Form.Group>
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
