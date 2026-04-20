import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const API = "http://localhost:8080";

// Normalize backend user shape
function normalizeUser(userData) {
    if (!userData) return null;

    return {
        ...userData,
        id: userData.id || userData.userId || "",
        userId: userData.userId || userData.id || "",
        fullName: userData.fullName || userData.name || "",
        name: userData.name || userData.fullName || "",
        email: userData.email || "",
        role: userData.role || "ROLE_USER",
        provider: userData.provider || "LOCAL",
        profilePictureUrl:
            userData.profilePictureUrl ||
            userData.profilePhotoUrl ||
            "",
    };
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Always allow cookies
    axios.defaults.withCredentials = true;

    // Restore session using backend cookie
   useEffect(() => {
    const restoreSession = async () => {
        try {
            const { data } = await axios.get(`${API}/api/users/me`, {
                withCredentials: true,
            });

            setCurrentUser(normalizeUser(data));
        } catch (err) {
            if (err.response?.status !== 401 && err.response?.status !== 403) {
                console.error("Session restore failed:", err);
            }
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    };

    restoreSession();
}, []);
    // Called after normal login, register, firebase login, or callback completion
    const login = (userData) => {
        const normalized = normalizeUser(userData?.user || userData);
        setCurrentUser(normalized);
    };

    const logout = async () => {
        try {
            await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
        } catch {
            // ignore logout error
        } finally {
            clearAuth();
        }
    };

    const clearAuth = () => {
        setCurrentUser(null);
    };

    // Cookie-based backend usually does not need Authorization header
    const getAuthHeader = () => ({});

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                    color: "#64748b",
                    fontSize: 14,
                    background: "#f8fafc",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            border: "3px solid #e2e8f0",
                            borderTopColor: "#3b82f6",
                            animation: "sc_spin 0.8s linear infinite",
                        }}
                    />
                    <span>Loading...</span>
                    <style>{`@keyframes sc_spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                login,
                logout,
                loading,
                getAuthHeader,
                clearAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
