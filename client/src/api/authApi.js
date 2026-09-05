import api from "./axios";

export const authApi = {
  async login(credentials) {
    const { data } = await api.post("/auth/login", credentials);
    return data.data;
  },

  async register(userData) {
    const { data } = await api.post("/auth/signup", userData);
    return data.data;
  },

  async me() {
    const { data } = await api.get("/auth/me");
    return data.data.user;
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Best-effort logout
    }
  },

  async changePassword(passwords) {
    const { data } = await api.patch("/auth/password", passwords);
    return data;
  },
};

