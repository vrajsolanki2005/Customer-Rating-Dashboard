import api from "./axios";

export const adminApi = {
  async getDashboard() {
    const { data } = await api.get("/admin/dashboard");
    return data.data;
  },

  async getUsers(params = {}, signal) {
    const { data } = await api.get("/admin/users", { params, signal });
    return {
      items: data.data || [],
      ...(data.pagination || {}),
    };
  },

  async getUser(id) {
    const { data } = await api.get(`/admin/users/${id}`);
    const user = data.data;
    return {
      user,
      stores: user?.stores || [],
    };
  },

  async createUser(payload) {
    const { data } = await api.post("/admin/users", payload);
    return data;
  },

  async updateUser(id, payload) {
    const { data } = await api.patch(`/admin/users/${id}`, payload);
    return data;
  },

  async deleteUser(id) {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },

  async getStores(params = {}, signal) {
    const { data } = await api.get("/admin/stores", { params, signal });
    return {
      items: (data.data || []).map((store) => ({
        ...store,
        overallRating: store.rating ?? null,
      })),
      ...(data.pagination || {}),
    };
  },

  async updateStore(id, payload) {
    const { data } = await api.patch(`/admin/stores/${id}`, payload);
    return data;
  },

  async deleteStore(id) {
    const { data } = await api.delete(`/admin/stores/${id}`);
    return data;
  },

  async createStore(payload) {
    const { data } = await api.post("/admin/stores", payload);
    return data;
  },
};

