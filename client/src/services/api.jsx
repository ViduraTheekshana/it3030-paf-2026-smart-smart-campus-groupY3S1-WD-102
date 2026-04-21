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

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			window.location.href = "/login";
		}
		return Promise.reject(error);
	},
);
