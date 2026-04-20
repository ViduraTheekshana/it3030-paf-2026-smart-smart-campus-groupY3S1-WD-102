import { Outlet } from "react-router-dom";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ResourcePage from "./pages/ResourcePage";
import { Header } from "./components/layout/Header";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./pages/Login";

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
		<Router>
			<AuthProvider>
				<NotificationProvider>
					<Routes>
						{/* Login gets its own route with NO header */}
						<Route path="/login" element={<Login />} />

						{/* Everything inside this Layout route WILL have the header */}
						{/* <Route element={<MainLayout />}>
							<Route path="/resources" element={<ResourcePage />} />
							<Route path="/dashboard" element={<div>Dashboard</div>} />
						</Route> */}
					</Routes>
				</NotificationProvider>
			</AuthProvider>
		</Router>
	);
}

export default App;
