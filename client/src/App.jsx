import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/Profile";
import BookingPage from "./pages/BookingPage";
import ResourcePage from "./pages/ResourcePage";
import AdminBookingManagement from "./pages/AdminBookingManagement";
import UserDashboard from "./pages/UserDashboard";

const Dashboard = () => (
  <div style={{ padding: "2rem", fontFamily: "DM Sans, sans-serif" }}>
    <h2>Dashboard</h2>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
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
          <Route
  path="/admin/userdashboard"
  element={
    <ProtectedRoute roles={["ROLE_ADMIN"]}>
      <UserDashboard />
    </ProtectedRoute>
  }
/>

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN"]}>
                <AdminBookingManagement />
              </ProtectedRoute>
            }
          />

          {/* Default */}
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
