const { z } = require("zod");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password must be at most 16 characters")
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter"
  )
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(20, "Name must be at least 20 characters")
    .max(60, "Name must be at most 60 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address"),

  password: passwordSchema,

  address: z
    .string()
    .trim()
    .max(400, "Address must be at most 400 characters"),

  role: z.enum(["ADMIN", "USER", "STORE_OWNER"]),
});

const createStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(20, "Store name must be at least 20 characters")
    .max(60, "Store name must be at most 60 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address"),

  address: z
    .string()
    .trim()
    .max(400, "Address must be at most 400 characters"),

  ownerId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
});

module.exports = {
  createUserSchema,
  createStoreSchema,
};