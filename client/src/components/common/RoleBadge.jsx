import { Badge } from "../ui/Badge";

const ROLE_TONES = { ADMIN: "violet", USER: "sky", STORE_OWNER: "amber" };
export const ROLE_LABELS = { ADMIN: "Admin", USER: "User", STORE_OWNER: "Store Owner" };

export function roleLabel(role) {
  return ROLE_LABELS[role] || role || "User";
}

export function RoleBadge({ role }) {
  return <Badge tone={ROLE_TONES[role] || "slate"}>{roleLabel(role)}</Badge>;
}
