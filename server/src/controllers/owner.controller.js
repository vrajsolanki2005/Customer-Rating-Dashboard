const prisma = require("../config/prisma");

const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const {
      name,
      email,
      sortBy = "createdAt",
      order = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);

    const pageSize = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const skip = (currentPage - 1) * pageSize;

    const allowedSortFields = [
      "createdAt",
      "rating",
    ];

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortOrder = order === "asc" ? "asc" : "desc";

    // First find stores owned by current owner
    const stores = await prisma.store.findMany({
      where: {
        ownerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const storeIds = stores.map((store) => store.id);

    // No stores assigned
    if (storeIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          stores: [],
          totalRatings: 0,
          averageRating: 0,
          ratings: [],
        },
        pagination: {
          page: currentPage,
          limit: pageSize,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // User filters
    const userFilter = {};

    if (name) {
      userFilter.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (email) {
      userFilter.email = {
        contains: email,
        mode: "insensitive",
      };
    }

    const where = {
      storeId: {
        in: storeIds,
      },
      user: userFilter,
    };

    // Get total number of ratings
    const total = await prisma.rating.count({
      where,
    });

    // Get ratings
    const ratings = await prisma.rating.findMany({
      where,

      orderBy: {
        [sortField]: sortOrder,
      },

      skip,
      take: pageSize,

      select: {
        id: true,
        rating: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },

        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate average rating for all owner's stores
    const averageResult = await prisma.rating.aggregate({
      where: {
        storeId: {
          in: storeIds,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const averageRating = averageResult._avg.rating || 0;

    const totalRatings = averageResult._count.rating || 0;

    return res.status(200).json({
      success: true,

      data: {
        stores,

        totalRatings,

        averageRating: Number(averageRating.toFixed(2)),

        ratings: ratings.map((item) => ({
          id: item.id,

          user: {
            id: item.user.id,
            name: item.user.name,
            email: item.user.email,
            address: item.user.address,
          },

          store: {
            id: item.store.id,
            name: item.store.name,
          },

          rating: item.rating,

          createdAt: item.createdAt,
        })),
      },

      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateStore = async (req, res, next) => {
  try {
    const storeId = Number(req.params.id);
    const ownerId = req.user.id;
    const { name, email, address } = req.body;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });
    if (store.ownerId !== ownerId) return res.status(403).json({ success: false, message: "You do not own this store" });

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(address && { address }),
      },
      select: { id: true, name: true, email: true, address: true },
    });

    return res.status(200).json({ success: true, message: "Store updated successfully", data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOwnerDashboard, updateStore };