import { KeyRound, Store } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";

const NAV_ITEMS = [
  { to: "/user/stores", label: "Stores", icon: Store },
  { to: "/user/change-password", label: "Change Password", icon: KeyRound },
];

export default function UserLayout() {
  return <AppShell navItems={NAV_ITEMS} />;
}
