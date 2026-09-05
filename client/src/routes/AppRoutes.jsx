import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import OwnerLayout from "../layouts/OwnerLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import CreateUser from "../pages/admin/CreateUser";
import UserDetails from "../pages/admin/UserDetails";
import AdminStores from "../pages/admin/Stores";
import CreateStore from "../pages/admin/CreateStore";
import UserStores from "../pages/user/Stores";
import UserChangePassword from "../pages/user/ChangePassword";
import OwnerDashboard from "../pages/owner/Dashboard";
import OwnerChangePassword from "../pages/owner/ChangePassword";
import NotFound from "../pages/NotFound";
import RoleRoute from "./RoleRoute";
import { useAuth } from "../hooks/useAuth";
import { FullScreenLoader } from "../components/common/LoadingSpinner";
import { roleHome } from "../utils/auth";

function RootRedirect() {
  const { isAuthenticated, initializing, user } = useAuth();
  if (initializing) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome(user?.role)} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<RoleRoute role="ADMIN" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/create" element={<CreateUser />} />
          <Route path="/admin/users/:id" element={<UserDetails />} />
          <Route path="/admin/stores" element={<AdminStores />} />
          <Route path="/admin/stores/create" element={<CreateStore />} />
        </Route>
      </Route>

      <Route element={<RoleRoute role="USER" />}>
        <Route element={<UserLayout />}>
          <Route path="/user/stores" element={<UserStores />} />
          <Route path="/user/change-password" element={<UserChangePassword />} />
        </Route>
      </Route>

      <Route element={<RoleRoute role="STORE_OWNER" />}>
        <Route element={<OwnerLayout />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/change-password" element={<OwnerChangePassword />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
