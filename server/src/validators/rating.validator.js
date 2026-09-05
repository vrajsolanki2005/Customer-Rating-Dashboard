const { z } = require("zod");

const ratingSchema = z.object({
  rating: z.coerce
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});

module.exports = {
  ratingSchema,
};