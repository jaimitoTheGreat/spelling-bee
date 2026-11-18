export type Rol = "organizador" | "juez";

export interface Usuario {
  id: string;
  email?: string;
  nombre: string;
  rol: Rol;
}

export type EstadoJuez = "activo" | "inactivo";

export interface Juez {
  id: string;
  nombre: string;
  estado: EstadoJuez;
  codigo: string;          // en la UI se muestra enmascarado
}

export interface RespuestaCreacionJuez {
  juez: Juez;
  codigo: string;          // código en claro, solo se muestra una vez
}

// Agrega esto al final de src/types/index.ts

export type NivelMCER = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Muerte Súbita';
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
  nivel_mcer: NivelMCER;
  audio_url: string | null;
  usado: boolean;
  created_at: string;
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
  updated_at: string; // <-- AGREGA ESTA LÍNEA
}

// Criterios oficiales del Sprint II
export const CRITERIOS = [
  ["deletreo", "Deletreo y ortografía"],
  ["pronunciacion", "Pronunciación"],
  ["fluidez", "Fluidez y ritmo"],
] as const;

export interface Participante {
  id: string;
  nombre: string;
  institucion: string;
  nivel_mcer: NivelMCER;
  estado: EstadoParticipante;
  orden_participacion: number; // <-- NUEVO
  created_at: string;
}

export interface EstadoConcurso {
  participante_actual_id: string | null;
  palabra_actual_id: string | null;
  votacion_abierta: boolean;
  tipo_ronda: 'regular' | 'muerte_subita'; // <-- NUEVO
}

export interface HistorialEvento {
  id: string;
  mensaje: string;
  tipo: string;
  created_at: string;
}