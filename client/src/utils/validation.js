import { z } from "zod";

export const PASSWORD_HINT =
  "8–16 characters with at least one uppercase letter and one special character.";

export const nameSchema = z
  .string()
  .trim()
  .min(10, "Name must be at least 10 characters.")
  .max(60, "Name must be at most 60 characters.");

export const storeNameSchema = z
  .string()
  .trim()
  .min(10, "Store name must be at least 10 characters.")
  .max(60, "Store name must be at most 60 characters.");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.");

export const addressSchema = z
  .string()
  .trim()
  .max(400, "Address must be at most 400 characters.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(16, "Password must be at most 16 characters.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one special character.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    address: addressSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
  role: z.enum(["ADMIN", "USER", "STORE_OWNER"], {
    errorMap: () => ({ message: "Select a role." }),
  }),
});

export const createStoreSchema = z.object({
  name: storeNameSchema,
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string().min(1, "Select a store owner."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  });
