import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiFetchContext } from "./ApiFetchContext";
import { AuthContext } from "./AuthContext";

export const HotelContext = createContext();

export const HotelProvider = ({ children }) => {
  const { baseURL, post } = useContext(ApiFetchContext);
  const { accessToken } = useContext(AuthContext);

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [calendar, setCalendar] = useState({}); // 🗓️ { roomId: [bookedDates] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------------------------
  // 🏨 Fetch Public Rooms (All, booked or not)
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
  // 📅 Fetch Room Calendar (Booked Dates)
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
  // 🛠️ Fetch All Rooms (Admin)
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

  // ---------------------------
  // ➕ Add Room (Admin)
  // ---------------------------
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
      if (!res.ok) throw new Error(data.detail || "Failed to add room");
      setRooms((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // ✏️ Update Room (Admin)
  // ---------------------------
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
      if (!res.ok) throw new Error(data.detail || "Failed to update room");

      setRooms((prev) => prev.map((r) => (r.id === roomId ? data : r)));
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // ❌ Delete Room (Admin)
  // ---------------------------
  const deleteRoom = async (roomId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}/hotel/admin/rooms/${roomId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
      } else {
        throw new Error("Failed to delete room");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 📅 Fetch All Bookings (Admin)
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
  // 🧾 Create Booking (Public)
  // ---------------------------
  const createBooking = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await post("/hotel/bookings/", data);

      if (res.error) throw new Error(res.error);
      if (
        res.message &&
        res.message.includes("❌ These dates are already booked")
      ) {
        throw new Error("These dates are already booked. Please choose others.");
      }

      setBookings((prev) => [res.booking, ...prev]);
      await fetchRoomCalendar(res.booking.room.id); // 🗓️ Refresh calendar
      return res.booking;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // ♻️ Update Booking (Admin)
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
      if (!res.ok) throw new Error(updated.detail || "Failed to update booking");

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updated : b))
      );
      return updated;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 🗑️ Delete Booking (Admin)
  // ---------------------------
  const deleteBooking = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseURL}/hotel/bookings/${bookingId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      } else {
        throw new Error("Failed to delete booking");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 🌐 Auto-fetch public rooms on mount
  // ---------------------------
  useEffect(() => {
    fetchPublicRooms();
  }, []);

  return (
    <HotelContext.Provider
      value={{
        rooms,
        bookings,
        calendar,
        loading,
        error,
        fetchPublicRooms,
        fetchRoomCalendar, // ✅ new helper
        fetchAllRooms,
        addRoom,
        updateRoom,
        deleteRoom,
        fetchBookings,
        createBooking,
        updateBooking,
        deleteBooking,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};
