import axios from "axios";

const BASE_URL = "http://localhost:8080/api/bookings";

export const createBooking = (data, userId, resourceID) =>
  axios.post(BASE_URL, data, {
    params: { userId, resourceID }
  });

export const getBookings = () =>
  axios.get(BASE_URL);

export const deleteBooking = (id) =>
  axios.delete(`${BASE_URL}/${id}`);

export const approveBooking = (id) =>
  axios.put(`${BASE_URL}/${id}/approve`);

export const rejectBooking = (id, reason) =>
  axios.put(`${BASE_URL}/${id}/reject`, null, {
    params: { rejectReason: reason }
  });
  