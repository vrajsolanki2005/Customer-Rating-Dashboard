import { LayoutDashboard, Store, PlusCircle, UserPlus, Users } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/users/create", label: "Create User", icon: UserPlus },
  { to: "/admin/stores", label: "Stores", icon: Store },
  { to: "/admin/stores/create", label: "Create Store", icon: PlusCircle },
];

export default function AdminLayout() {
  return <AppShell navItems={NAV_ITEMS} />;
}
