import axios from "axios";

const BASE = "http://localhost:8080/resources";

export const getAllResources = () => {
  return axios.get(BASE);
};

// GET ALL
export const getAll = async () => {
  return await axios.get(BASE);
};


// GET BY ID
export const getById = async (id) => {
  return await axios.get(`${BASE}/${id}`);
};

// CREATE
export const create = async (data) => {
  return await axios.post(BASE, data);
};

// UPDATE
export const update = async (id, data) => {
  return await axios.put(`${BASE}/${id}`, data);
};

// DELETE
export const remove = async (id) => {
  return await axios.delete(`${BASE}/${id}`);
};

// FILTER (VERY IMPORTANT )
export const filterResources = async (filters) => {
  return await axios.get(`${BASE}/filter`, {
    params: filters,
  });
};

// DASHBOARD SUMMARY
export const summary = async () => {
  return await axios.get(`${BASE}/summary`);
};

// IMAGE UPLOAD
export const upload = async (formData) => {
  return await axios.post(`${BASE}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};