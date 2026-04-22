import { Outlet } from "react-router-dom";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ResourcePage from "./pages/ResourcePage";
import AddResource from "./pages/AddResource";
import AdminResources from "./pages/AdminResources";
import EditResource from "./pages/EditResource";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/SideBar";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { IncidentsList } from "./pages/incidents/IncidentsList";
import { CreateIncident } from "./pages/incidents/CreateIncident";
import { IncidentDetail } from "./pages/incidents/IncidentDetail";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import UserDashboard from "./pages/UserDashboard";
import AdminBookingManagement from "./pages/AdminBookingManagement";
import BookingPage from "./pages/BookingPage";
import BookingForm from "./components/BookingForm";
import UpdateBookingForm from "./components/UpdateBookingForm";
import { Landing } from "./pages/Landing";

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
						<Route path="/" element={<Landing />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route
							path="/profile"
							element={
								<ProtectedRoute>
									<Layout>
										<Profile />
									</Layout>
								</ProtectedRoute>
							}
						/>
						{/* Resource Management Routes */}
						<Route
							path="/resources"
							element={
								<ProtectedRoute>
									<Layout>
										<AdminResources />
									</Layout>
								</ProtectedRoute>
							}
						/>

						<Route
							path="/resources/add"
							element={
								<ProtectedRoute>
									<Layout>
										<AddResource />
									</Layout>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/resources/edit/:id"
							element={
								<ProtectedRoute>
									<Layout>
										<EditResource />
									</Layout>
								</ProtectedRoute>
							}
						/>

						<Route
							path="/user"
							element={
								<ProtectedRoute>
									<Layout>
										<ResourcePage />
									</Layout>
								</ProtectedRoute>
							}
						/>

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
							path="/dashboard"
							element={
								<ProtectedRoute>
									<Layout>
										<UserDashboard />
									</Layout>
								</ProtectedRoute>
							}
						/>

									</Layout>
								</ProtectedRoute>
							}
						/>

						<Route
						<Route
							path="/dashboard"
							element={
								<ProtectedRoute>
									<Layout>
										<UserDashboard />
									</Layout>
								</ProtectedRoute>
							}
						/>

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
