import { z } from "zod";

export const crearJuezSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
});

export type CrearJuezForm = z.infer<typeof crearJuezSchema>;