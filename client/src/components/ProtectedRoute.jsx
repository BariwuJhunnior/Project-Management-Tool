import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading application...
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const RoleRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
