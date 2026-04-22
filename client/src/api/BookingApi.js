import axios from "axios";

const BASE_URL = "http://localhost:8080/api/bookings";

// IMPORTANT: allow cookies (SESSION BASED AUTH)
axios.defaults.withCredentials = true;

// GET ALL
export const getAllBookings = () => axios.get(BASE_URL);

// CREATE
export const createBooking = (data, resourceID) =>
  axios.post(BASE_URL, data, {
    params: { resourceID }
  });

// DELETE
export const deleteBooking = (id) =>
  axios.delete(`${BASE_URL}/${id}`);

// APPROVE
export const approveBooking = (id) =>
  axios.put(`${BASE_URL}/${id}/approve`);

// REJECT
export const rejectBooking = (id, reason) =>
  axios.put(`${BASE_URL}/${id}/reject`, null, {
    params: { rejectReason: reason }
  });