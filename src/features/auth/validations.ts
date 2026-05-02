import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[0-9]/, "Must include a number"),
});

export const signInSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
  redirectTo: z.string().optional(),
});
