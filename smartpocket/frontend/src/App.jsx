import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ParentDashboard from "./pages/ParentDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function PrivateRoute({ children, role }) {
  const { currentUser, profile } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && profile?.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { currentUser, profile } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          !currentUser ? (
            <Navigate to="/login" replace />
          ) : profile?.role === "parent" ? (
            <Navigate to="/parent" replace />
          ) : (
            <Navigate to="/student" replace />
          )
        }
      />
      <Route
        path="/parent"
        element={
          <PrivateRoute role="parent">
            <ParentDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/student"
        element={
          <PrivateRoute role="student">
            <StudentDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
