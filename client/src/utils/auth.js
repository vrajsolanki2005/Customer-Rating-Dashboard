export const TOKEN_KEY = "sr_token";
export const USER_KEY = "sr_user";

export const ROLE_HOME = {
  ADMIN: "/admin/dashboard",
  USER: "/user/stores",
  STORE_OWNER: "/owner/dashboard",
};

export function roleHome(role) {
  return ROLE_HOME[role] || "/login";
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}

export function setStoredAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
