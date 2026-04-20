import React from "react";
import { api } from "./api";

export const googleLogin = async (firebaseToken) => {
	const response = await api.post("/auth/firebase", {
		token: firebaseToken,
	});
	return response.data;
};

export const getCurrentUser = async () => {
	const response = await api.get("/users/me");
	return response.data;
};

export const emailLogin = async (email, password) => {
	const response = await api.post("/auth/login", {
		email,
		password,
	});
	return response.data;
};
