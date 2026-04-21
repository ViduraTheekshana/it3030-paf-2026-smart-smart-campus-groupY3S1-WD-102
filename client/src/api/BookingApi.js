import axios from "axios";

const BASE_URL = "http://localhost:8080/api/bookings";

export const createBooking = (data, resourceID) =>
  axios.post(BASE_URL, data, {
    params: { resourceID },
    withCredentials: true // Important: Include cookies in request
  });

export const getBookings = () =>
  axios.get(BASE_URL, {
    withCredentials: true // Important: Include cookies in request
  });

export const deleteBooking = (id) =>
  axios.delete(`${BASE_URL}/${id}`, {
    withCredentials: true // Important: Include cookies in request
  });

export const approveBooking = (id) =>
  axios.put(`${BASE_URL}/${id}/approve`, null, {
    withCredentials: true // Important: Include cookies in request
  });

export const rejectBooking = (id, reason) =>
  axios.put(`${BASE_URL}/${id}/reject`, null, {
    params: { rejectReason: reason },
    withCredentials: true // Important: Include cookies in request
  });