import { Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";

import { Header } from "./components/layout/Header";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";

import { Toaster } from "sonner";

import { Login } from "./pages/Login";
import  Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import  Profile from "./pages/Profile";
import ResourcePage from "./pages/ResourcePage";
import  BookingPage  from "./pages/BookingPage";
import AdminBookingManagement from "./pages/AdminBookingManagement";
import  UserDashboard  from "./pages/UserDashboard";
import { IncidentsList } from "./pages/incidents/IncidentsList";
import { CreateIncident } from "./pages/incidents/CreateIncident";
import { IncidentDetail } from "./pages/incidents/IncidentDetail";

// Optional layout with header if you want to use it later
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

const Dashboard = () => (
  <div style={{ padding: "2rem", fontFamily: "DM Sans, sans-serif" }}>
    <h2>Dashboard</h2>
  </div>
);

function App() {
  return (
      <AuthProvider>
        <NotificationProvider>
          <Toaster position="top-right" richColors />

          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected user routes */}
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

            {/* Incident routes */}
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

            {/* Admin routes */}
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

            {/* Default */}
            <Route path="*" element={<Login />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
  );
}

export default App;
