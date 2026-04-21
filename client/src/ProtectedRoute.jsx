import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function ProtectedRoute({ children, roles = [] }) {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) return null;

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles.length > 0 && !roles.includes(currentUser.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
