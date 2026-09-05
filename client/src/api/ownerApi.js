import api from "./axios";

export const ownerApi = {
  async updateStore(id, payload) {
    const { data } = await api.patch(`/owner/stores/${id}`, payload);
    return data;
  },

  async getDashboard(params = {}, signal) {
    const { data } = await api.get("/owner/dashboard", { params, signal });
    const payload = data.data || {};
    const rawRatings = payload.ratings || [];
    const pagination = payload.pagination || {};

    return {
      stores: payload.stores || [],
      averageRating: payload.averageRating ?? null,
      totalRatings: payload.totalRatings ?? 0,
      ratings: {
        items: rawRatings.map((r) => ({
          id: r.id,
          userName: r.user?.name || "",
          email: r.user?.email || "",
          address: r.user?.address || "",
          storeName: r.store?.name || "",
          rating: r.rating,
          date: r.createdAt,
        })),
        total: pagination.total ?? rawRatings.length,
        totalPages: pagination.totalPages ?? 1,
      },
    };
  },
};
