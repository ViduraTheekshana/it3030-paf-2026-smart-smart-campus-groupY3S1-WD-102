import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute({ children, requiredRoles = [] }) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (requiredRoles.length > 0) {
		const hasRequiredRole = requiredRoles.some((role) =>
			user.roles?.includes(role),
		);

		if (!hasRequiredRole) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
						<p className="text-gray-600">
							You don't have permission to access this page.
						</p>
					</div>
				</div>
			);
		}
	}
	return children;
}
