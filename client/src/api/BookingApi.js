import axios from "axios";

const BASE_URL = "http://localhost:8080/api/bookings";

// GET ALL (FIXED)

export const getAllBookings = (token) =>
  axios.get(BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }); 

 

// CREATE
export const createBooking = (data, resourceID, token) =>
  axios.post(BASE_URL, data, {
    params: { resourceID },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

// DELETE
export const deleteBooking = (id, token) =>
  axios.delete(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

// APPROVE
export const approveBooking = (id, token) =>
  axios.put(`${BASE_URL}/${id}/approve`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

// REJECT
export const rejectBooking = (id, reason, token) =>
  axios.put(`${BASE_URL}/${id}/reject`, null, {
    params: { rejectReason: reason },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });