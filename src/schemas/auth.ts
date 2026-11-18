import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const accesoJuezSchema = z.object({
  codigo: z
    .string()
    .regex(/^SB-[A-Z0-9]{4}$/i, "Formato de código inválido (ej: SB-4821)"),
});

export type AccesoJuezForm = z.infer<typeof accesoJuezSchema>;