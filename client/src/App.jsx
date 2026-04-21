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

// Admin layout with Sidebar
function AdminLayout() {
	return (
		<div className="flex bg-gray-50 min-h-screen">
			<Sidebar />
			<div className="flex-1 lg:ml-0">
				<Outlet />
			</div>
		</div>
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

						{/* Resource Management Routes */}
						<Route path="/resources" element={<AdminLayout />}>
							<Route index element={<AdminResources />} />
						</Route>
						<Route path="/resources/add" element={<AddResource />} />
						<Route path="/resources/edit/:id" element={<EditResource />} />
						<Route path="/user" element={<ResourcePage />} />

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
					</Routes>
				</NotificationProvider>
			</AuthProvider>
		</>
	);
}

export default App;

