const { z } = require("zod");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password must be at most 16 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const signupSchema = z.object({
  name: z.string().trim().min(10, "Name must be at least 10 characters").max(60, "Name must be at most 60 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  address: z.string().trim().max(400, "Address must be at most 400 characters"),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

module.exports = { signupSchema, loginSchema, changePasswordSchema };
