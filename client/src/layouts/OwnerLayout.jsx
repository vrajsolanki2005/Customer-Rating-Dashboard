import { KeyRound, LayoutDashboard } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";

const NAV_ITEMS = [
  { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/owner/change-password", label: "Change Password", icon: KeyRound },
];

export default function OwnerLayout() {
  return <AppShell navItems={NAV_ITEMS} />;
}
