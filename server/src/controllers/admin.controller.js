const bcrypt = require("bcryptjs");

const prisma = require("../config/prisma");

const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      address,
      role,
    } = req.body;

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  try {
    const {
      name,
      email,
      address,
      ownerId,
    } = req.body;

    // If ownerId is provided, verify owner
    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: {
          id: ownerId,
        },
      });

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Store owner not found",
        });
      }

      if (owner.role !== "STORE_OWNER") {
        return res.status(400).json({
          success: false,
          message: "Selected user is not a store owner",
        });
      }
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId: ownerId || null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStores,
      totalRatings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const {
      name,
      email,
      address,
      role,
      sortBy = "name",
      order = "asc",
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (email) {
      where.email = {
        contains: email,
        mode: "insensitive",
      };
    }

    if (address) {
      where.address = {
        contains: address,
        mode: "insensitive",
      };
    }

    if (role) {
      if (
        !["ADMIN", "USER", "STORE_OWNER"].includes(role)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      where.role = role;
    }

    const allowedSortFields = [
      "name",
      "email",
      "address",
      "role",
      "createdAt",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "name";

    const safeOrder = order === "desc" ? "desc" : "asc";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,

        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
        },

        orderBy: {
          [safeSortBy]: safeOrder,
        },

        skip,
        take: limitNumber,
      }),

      prisma.user.count({
        where,
      }),
    ]);

    return res.status(200).json({
      success: true,

      data: users,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserDetails = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,

        stores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,

            ratings: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
    };

    if (user.role === "STORE_OWNER") {
      response.stores = user.stores.map((store) => {
        const ratings = store.ratings;

        const averageRating =
          ratings.length > 0
            ? ratings.reduce(
                (sum, item) => sum + item.rating,
                0
              ) / ratings.length
            : 0;

        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          rating: Number(averageRating.toFixed(2)),
        };
      });
    }

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const getStores = async (req, res, next) => {
  try {
    const {
      name,
      email,
      address,
      sortBy = "name",
      order = "asc",
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (email) {
      where.email = {
        contains: email,
        mode: "insensitive",
      };
    }

    if (address) {
      where.address = {
        contains: address,
        mode: "insensitive",
      };
    }

    const allowedSortFields = [
      "name",
      "email",
      "address",
      "createdAt",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "name";

    const safeOrder = order === "desc" ? "desc" : "asc";

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,

        select: {
          id: true,
          name: true,
          email: true,
          address: true,

          ratings: {
            select: {
              rating: true,
            },
          },
        },

        orderBy: {
          [safeSortBy]: safeOrder,
        },

        skip,
        take: limitNumber,
      }),

      prisma.store.count({
        where,
      }),
    ]);

    const formattedStores = stores.map((store) => {
      const ratings = store.ratings;

      const averageRating =
        ratings.length > 0
          ? ratings.reduce(
              (sum, item) => sum + item.rating,
              0
            ) / ratings.length
          : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        rating: Number(averageRating.toFixed(2)),
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedStores,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  createStore,
  getDashboard,
  getUsers,
  getUserDetails,
  getStores,
};