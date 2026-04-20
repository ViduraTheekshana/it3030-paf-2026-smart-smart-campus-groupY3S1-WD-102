import { Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./ProtectedRoute";

import { Header } from "./components/layout/Header";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/Profile";
import BookingPage from "./pages/BookingPage";
import ResourcePage from "./pages/ResourcePage";
import AdminBookingManagement from "./pages/AdminBookingManagement";
import UserDashboard from "./pages/UserDashboard";

import { IncidentsList } from "./pages/incidents/IncidentsList";
import { CreateIncident } from "./pages/incidents/CreateIncident";
import { IncidentDetail } from "./pages/incidents/IncidentDetail";

const Dashboard = () => (
	<div style={{ padding: "2rem", fontFamily: "DM Sans, sans-serif" }}>
		<h2>Dashboard</h2>
	</div>
);

// Layout with header for authenticated pages
function MainLayout() {
	return (
		<>
			<Header />
			<main>
				<Outlet />
			</main>
		</>
	);
}

function App() {
	return (
		<AuthProvider>
			<NotificationProvider>
				<Routes>
					{/* Public routes without header */}
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/forgot-password" element={<ForgotPassword />} />

					{/* Protected Routes wrapped with Header layout */}
					<Route element={<MainLayout />}>
						{/* General User Routes */}
						<Route
							path="/dashboard"
							element={
								<ProtectedRoute>
									<Dashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/profile"
							element={
								<ProtectedRoute>
									<Profile />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/resources"
							element={
								<ProtectedRoute>
									<ResourcePage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/bookings"
							element={
								<ProtectedRoute>
									<BookingPage />
								</ProtectedRoute>
							}
						/>

						{/* Incident Routes */}
						<Route
							path="/incidents"
							element={
								<ProtectedRoute>
									<IncidentsList />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/incidents/new"
							element={
								<ProtectedRoute>
									<CreateIncident />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/incidents/:id"
							element={
								<ProtectedRoute>
									<IncidentDetail />
								</ProtectedRoute>
							}
						/>

						{/* Admin Routes */}
						<Route
							path="/admin/userdashboard"
							element={
								<ProtectedRoute roles={["ROLE_ADMIN"]}>
									<UserDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/dashboard"
							element={
								<ProtectedRoute roles={["ROLE_ADMIN"]}>
									<AdminBookingManagement />
								</ProtectedRoute>
							}
						/>
					</Route>

					{/* Default fallback */}
					<Route path="*" element={<Login />} />
				</Routes>
			</NotificationProvider>
		</AuthProvider>
	);
}

export default App;
