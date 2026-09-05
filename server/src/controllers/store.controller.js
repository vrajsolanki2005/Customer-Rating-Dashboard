const prisma = require("../config/prisma");

const getStores = async (req, res, next) => {
  try {
    const { name } = req.query;

    const where = name
      ? { name: { contains: name, mode: "insensitive" } }
      : {};

    const stores = await prisma.store.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        ratings: { select: { rating: true } },
      },
      orderBy: { name: "asc" },
    });

    const data = stores.map(({ ratings, ...store }) => {
      const avg =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;
      return { ...store, rating: Number(avg.toFixed(2)) };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const submitRating = async (req, res, next) => {
  try {
    const storeId = Number(req.params.storeId);
    const userId = req.user.id;
    const { rating } = req.body;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    const existing = await prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "You have already rated this store" });
    }

    const data = await prisma.rating.create({
      data: { rating, userId, storeId },
    });

    return res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateRating = async (req, res, next) => {
  try {
    const storeId = Number(req.params.storeId);
    const userId = req.user.id;
    const { rating } = req.body;

    const existing = await prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }

    const data = await prisma.rating.update({
      where: { userId_storeId: { userId, storeId } },
      data: { rating },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStores, submitRating, updateRating };
