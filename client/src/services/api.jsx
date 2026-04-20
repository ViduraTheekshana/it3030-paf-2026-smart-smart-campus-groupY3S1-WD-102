import React from "react";
import axios from "axios";

const axiosConfig = {
	baseURL: "http://localhost:8080",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
};

export const api = axios.create({
	...axiosConfig,
	baseURL: `${axiosConfig.baseURL}/api`,
});

export const authApi = axios.create({
	...axiosConfig,
	baseURL: `${axiosConfig.baseURL}/auth`,
});
