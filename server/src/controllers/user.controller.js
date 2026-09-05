const prisma = require("../config/prisma");

const getStores = async (req, res, next) => {
  try {
    const {
      name,
      address,
      email,
      sortBy = "name",
      order = "asc",
      page = "1",
      limit = "10",
    } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (currentPage - 1) * pageSize;

    const allowedSortFields = ["name", "email", "address", "createdAt"];

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "name";

    const sortOrder = order === "desc" ? "desc" : "asc";

    const where = {};

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (address) {
      where.address = {
        contains: address,
        mode: "insensitive",
      };
    }

    if (email) {
      where.email = {
        contains: email,
        mode: "insensitive",
      };
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
        },
      }),

      prisma.store.count({ where }),
    ]);

    const storeIds = stores.map((store) => store.id);

    let averageRatings = [];
    let userRatings = [];

    if (storeIds.length > 0) {
      [averageRatings, userRatings] = await Promise.all([
        prisma.rating.groupBy({
          by: ["storeId"],
          where: {
            storeId: {
              in: storeIds,
            },
          },
          _avg: {
            rating: true,
          },
        }),

        prisma.rating.findMany({
          where: {
            userId: req.user.id,
            storeId: {
              in: storeIds,
            },
          },
          select: {
            storeId: true,
            rating: true,
          },
        }),
      ]);
    }

    const averageMap = new Map(
      averageRatings.map((item) => [
        item.storeId,
        item._avg.rating,
      ])
    );

    const userRatingMap = new Map(
      userRatings.map((item) => [
        item.storeId,
        item.rating,
      ])
    );

    const data = stores.map((store) => ({
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,

      overallRating: averageMap.get(store.id) || 0,

      userRating: userRatingMap.has(store.id)
        ? userRatingMap.get(store.id)
        : null,
    }));

    return res.status(200).json({
      success: true,
      data,
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

module.exports = {
  getStores,
};