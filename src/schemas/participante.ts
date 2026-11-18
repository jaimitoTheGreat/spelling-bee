import { z } from "zod";

export const participanteSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  institucion: z.string().min(3, "La institución es requerida"),
  nivel_mcer: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
});

export type ParticipanteForm = z.infer<typeof participanteSchema>;