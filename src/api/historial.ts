import { supabase } from "../lib/supabase";

export interface EventoHistorial {
  id: string;
  mensaje: string;
  tipo: string; // 'info', 'voto', 'alerta', 'ronda'
  created_at: string;
}

export const historialApi = {
  listar: async (): Promise<EventoHistorial[]> => {
    const { data, error } = await supabase
      .from("historial_eventos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50); // Traemos los últimos 50 eventos
    if (error) throw new Error(error.message);
    return data as EventoHistorial[];
  },

  registrar: async (mensaje: string, tipo: string = "info") => {
    await supabase.from("historial_eventos").insert([{ mensaje, tipo }]);
  }
};