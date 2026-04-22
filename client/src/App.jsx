import { Outlet } from "react-router-dom";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ResourcePage from "./pages/ResourcePage";
import { Header } from "./components/layout/Header";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { IncidentsList } from "./pages/incidents/IncidentsList";
import { CreateIncident } from "./pages/incidents/CreateIncident";
import { IncidentDetail } from "./pages/incidents/IncidentDetail";
import AdminBookingManagement from "./pages/AdminBookingManagement";
import BookingPage from "./pages/BookingPage";

// A simple layout component that includes the Header
function MainLayout() {
	return (
		<>
			<Header />
			{/* Outlet is where the nested child routes will render */}
			<main>
				<Outlet />
			</main>
		</>
	);
}

function App() {
	return (
		<>
			<AuthProvider>
				<NotificationProvider>
					<Toaster position="top-right" richColors />
					<Routes>
						<Route path="/login" element={<Login />} />

						<Route
							path="/incidents"
							element={
								<ProtectedRoute>
									<Layout>
										<IncidentsList />
									</Layout>
								</ProtectedRoute>
							}
						/>

						<Route
							path="/incidents/new"
							element={
								<ProtectedRoute>
									<Layout>
										<CreateIncident />
									</Layout>
								</ProtectedRoute>
							}
						/>

						<Route
							path="/incidents/:id"
							element={
								<ProtectedRoute>
									<Layout>
										<IncidentDetail />
									</Layout>
								</ProtectedRoute>
							}
						/>

						<Route
							path="/bookings"
							element={
								<ProtectedRoute>
									<Layout>
										<AdminBookingManagement />
									</Layout>
								</ProtectedRoute>
							}
						/>

						<Route
							path="/bookings/create"
							element={
								<ProtectedRoute>
									<Layout>
										<BookingPage/>
									</Layout>
								</ProtectedRoute>
							}
						/>


					</Routes>
				</NotificationProvider>
			</AuthProvider>
		</>
	);
}

export default App;
