const prisma = require("../config/prisma");

const submitRating = async (req, res, next) => {
  try {
    const storeId = Number(req.params.storeId);
    const { rating } = req.body;

    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
    });

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message:
          "You have already rated this store. Use the modify rating option.",
      });
    }

    const newRating = await prisma.rating.create({
      data: {
        rating,
        userId: req.user.id,
        storeId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        id: newRating.id,
        storeId: newRating.storeId,
        rating: newRating.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};

const modifyRating = async (req, res, next) => {
  try {
    const storeId = Number(req.params.storeId);
    const { rating } = req.body;

    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
    });

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message:
          "You have not rated this store yet. Submit a rating first.",
      });
    }

    const updatedRating = await prisma.rating.update({
      where: {
        id: existingRating.id,
      },
      data: {
        rating,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Rating updated successfully",
      data: {
        id: updatedRating.id,
        storeId: updatedRating.storeId,
        rating: updatedRating.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitRating,
  modifyRating,
};