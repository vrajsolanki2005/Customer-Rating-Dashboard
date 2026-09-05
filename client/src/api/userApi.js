import api from "./axios";

export const userApi = {
  async getStores(params = {}, signal) {
    const { data } = await api.get("/user/stores", { params, signal });
    const stores = (data.data || []).map((store) => ({
      ...store,
      myRating: store.userRating ?? null,
    }));
    return {
      items: stores,
      ...(data.pagination || {}),
    };
  },

  async createRating(storeId, rating) {
    const { data } = await api.post(`/user/stores/${storeId}/rating`, { rating });
    return data;
  },

  async updateRating(storeId, rating) {
    const { data } = await api.put(`/user/stores/${storeId}/rating`, { rating });
    return data;
  },
};

