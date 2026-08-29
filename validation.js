import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Services autorisés                                                         */
/* -------------------------------------------------------------------------- */

export const allowedServices = [
  "Pentest Web",
  "Pentest Mobile",
  "Audit Infrastructure",
  "Red Team",
  "Bug Bounty",
  "Secure Development"
];

/* -------------------------------------------------------------------------- */
/* Validation formulaire contact                                              */
/* -------------------------------------------------------------------------- */

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom est trop long."),

  email: z
    .string()
    .trim()
    .email("Adresse email invalide.")
    .max(254, "Adresse email trop longue."),

  service: z
    .string()
    .trim()
    .refine(
      (value) => allowedServices.includes(value),
      {
        message: "Service invalide."
      }
    ),

  message: z
    .string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caractères.")
    .max(5000, "Le message est trop long.")
});

/* -------------------------------------------------------------------------- */
/* Login administrateur                                                       */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email invalide.")
    .max(254),

  password: z
    .string()
    .min(8, "Mot de passe invalide.")
    .max(200)
});

/* -------------------------------------------------------------------------- */
/* Modification du statut                                                     */
/* -------------------------------------------------------------------------- */

export const statusSchema = z.object({
  status: z.enum([
    "new",
    "read",
    "closed"
  ])
});
