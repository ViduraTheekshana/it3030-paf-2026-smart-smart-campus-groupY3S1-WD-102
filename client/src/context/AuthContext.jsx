import React, { useEffect, useState, createContext, useContext } from "react";
import { getCurrentUser } from "../services/auth";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getCurrentUser()
			.then((userData) => {
				setUser(userData);
			})
			.catch((error) => {
				console.error("Not authenticated:", error);
				setUser(null);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const login = (userData) => {
		setUser(userData);
	};

	const logout = async () => {
		try {
			await api.post("/auth/logout");
		} catch (error) {
			console.error("Logout API call failed", error);
		} finally {
			setUser(null);
		}
	};

	const isAdmin = () => user?.role === "ROLE_ADMIN";

	const isTechnician = () =>
		user?.role === "ROLE_TECHNICIAN" || user?.role === "ROLE_ADMIN";

	const isUser = () =>
		user?.role === "ROLE_USER" ||
		(!isAdmin() && user?.role !== "ROLE_TECHNICIAN");

	const getRoleAccent = () => {
		if (isAdmin()) return "red-600";
		if (user?.role === "ROLE_TECHNICIAN") return "blue-600";
		return "indigo-600";
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				login,
				logout,
				isAdmin,
				isTechnician,
				isUser,
				getRoleAccent,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
