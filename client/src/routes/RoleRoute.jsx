import { Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";
import Unauthorized from "../pages/Unauthorized";

export default function RoleRoute({ role }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.role !== role ? <Unauthorized requiredRole={role} /> : <Outlet />}
    </ProtectedRoute>
  );
}
