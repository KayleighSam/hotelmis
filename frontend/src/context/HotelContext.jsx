import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiFetchContext } from "./ApiFetchContext";
import { AuthContext } from "./AuthContext";

export const HotelContext = createContext();

export const HotelProvider = ({ children }) => {
  const { baseURL } = useContext(ApiFetchContext);
  const { accessToken } = useContext(AuthContext);

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [calendar, setCalendar] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------------------------
  // 🏨 Fetch all public rooms
  // ---------------------------
  const fetchPublicRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}/hotel/public/rooms/`);
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 📅 Fetch calendar for a specific room
  // ---------------------------
  const fetchRoomCalendar = async (roomId) => {
    try {
      const res = await fetch(`${baseURL}/hotel/public/rooms/${roomId}/calendar/`);
      if (!res.ok) throw new Error("Failed to fetch room calendar");
      const data = await res.json();
      setCalendar((prev) => ({
        ...prev,
        [roomId]: data.booked_days || [],
      }));
      return data.booked_days;
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  // ---------------------------
  // 🧾 Create a new booking (Public)
  // ---------------------------
  const createBooking = async ({
    room,
    client_name,
    client_email,
    client_phone, // ✅ Added phone number field
    check_in,
    check_out,
    amount_paid,
    adults,
    children,
    board_type, // ✅ Half Board / Full Board
  }) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        room,
        client_name,
        client_email,
        client_phone, // ✅ Include phone in payload
        check_in,
        check_out,
        amount_paid,
        adults,
        children,
        board_type,
      };

      const res = await fetch(`${baseURL}/hotel/bookings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.error ||
          data.detail ||
          "Booking failed. Please check your details and try again.";
        throw new Error(msg);
      }

      setBookings((prev) => [data.booking, ...prev]);
      await fetchRoomCalendar(payload.room);
      return data.booking;
    } catch (err) {
      setError(err.message);
      console.error("Booking creation error:", err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 📋 Fetch all bookings (Admin only)
  // ---------------------------
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}/hotel/bookings/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 🔍 Search Bookings by Email
  // ---------------------------
  const searchBookingByEmail = async (email) => {
    if (!email) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${baseURL}/hotel/bookings/search_by_email/?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No bookings found for this email");

      setSearchResults(data);
      return data;
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
      console.error("Search booking error:", err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 🛠️ Admin Room Management
  // ---------------------------
  const fetchAllRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}/hotel/admin/rooms/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch all rooms");
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRoom = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}/hotel/admin/rooms/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add room");

      setRooms((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateRoom = async (roomId, formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}/hotel/admin/rooms/${roomId}/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update room");

      setRooms((prev) => prev.map((r) => (r.id === roomId ? data : r)));
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}/hotel/admin/rooms/${roomId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete room");

      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      return data.message;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // ✏️ Update or Delete Booking (Admin)
  // ---------------------------
  const updateBooking = async (bookingId, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}/hotel/bookings/${bookingId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || "Failed to update booking");

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updated : b))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}/hotel/bookings/${bookingId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete booking");

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      return data.message;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 🌐 Fetch rooms automatically on mount
  // ---------------------------
  useEffect(() => {
    fetchPublicRooms();
  }, []);

  return (
    <HotelContext.Provider
      value={{
        rooms,
        bookings,
        searchResults,
        calendar,
        loading,
        error,
        fetchPublicRooms,
        fetchRoomCalendar,
        fetchAllRooms,
        addRoom,
        updateRoom,
        deleteRoom,
        fetchBookings,
        createBooking,
        updateBooking,
        deleteBooking,
        searchBookingByEmail,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};
