export type Rol = "organizador" | "juez";

export interface Usuario {
  id: string;
  email?: string;
  nombre: string;
  rol: Rol;
}

export type NivelMCER = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type NivelDificultad = 'Fácil' | 'Medio' | 'Difícil' | 'Extremo' | 'Muerte Súbita';
export type EstadoParticipante = 'activo' | 'clasificado' | 'eliminado';

export interface Participante {
  id: string;
  nombre: string;
  institucion: string;
  nivel_mcer: NivelMCER;
  estado: EstadoParticipante;
  orden_participacion: number;
  created_at: string;
}

export interface Palabra {
  id: string;
  palabra: string;
  ipa: string;
  nivel_mcer: NivelDificultad; // <-- Ahora usa el tipo de dificultad
  audio_url: string | null;
  usado: boolean;
  created_at: string;
}

export interface Juez {
  id: string;
  nombre: string;
  estado: "activo" | "inactivo";
  codigo: string;
}

export interface Evaluacion {
  id: string;
  juez_id: string;
  participante_id: string;
  palabra_id: string;
  criterios: Record<string, number>;
  enviado: boolean;
}

export interface EstadoConcurso {
  participante_actual_id: string | null;
  palabra_actual_id: string | null;
  votacion_abierta: boolean;
  tipo_ronda: 'regular' | 'muerte_subita';
  ronda_actual: number;
  updated_at: string;
}

export const CRITERIOS = [
  ["deletreo", "Deletreo y ortografía"],
  ["pronunciacion", "Pronunciación"],
  ["fluidez", "Fluidez y ritmo"],
] as const;