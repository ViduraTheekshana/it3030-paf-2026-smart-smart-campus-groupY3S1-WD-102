import { api } from "../services/api";

// GET ALL
export const getAllResources = () => api.get("/resources");
export const getAll = getAllResources;
export const getResources = getAllResources; // alias used by BookingForm

// GET BY ID
export const getById = (id) => api.get(`/resources/${id}`);

// CREATE
export const create = (data) => api.post("/resources", data);

// UPDATE
export const update = (id, data) => api.put(`/resources/${id}`, data);

// DELETE
export const remove = (id) => api.delete(`/resources/${id}`);

// FILTER
export const filterResources = (filters) =>
	api.get("/resources/filter", { params: filters });

// DASHBOARD SUMMARY
export const summary = () => api.get("/resources/summary");
export const getSummary = summary; // alias used by AdminResources

// IMAGE UPLOAD
export const upload = (formData) =>
	api.post("/resources/upload", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
