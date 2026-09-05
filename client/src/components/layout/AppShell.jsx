import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

export function AppShell({ navItems }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success("You have been logged out.");
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        navItems={navItems}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={() => setConfirmLogout(true)}
      />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar navItems={navItems} onMenuClick={() => setMobileOpen(true)} onLogout={() => setConfirmLogout(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400">
          StoreRate — Store Rating Platform
        </footer>
      </div>

      <Modal
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="Log out"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmLogout(false)} disabled={loggingOut}>
              Cancel
            </Button>
            <Button variant="danger" icon={LogOut} onClick={handleLogout} loading={loggingOut}>
              Log out
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Are you sure you want to log out of StoreRate?</p>
      </Modal>
    </div>
  );
}
