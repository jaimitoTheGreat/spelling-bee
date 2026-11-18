import { supabase } from "../lib/supabase";
import type { Participante, NivelMCER, EstadoParticipante } from "../types";

export const participantesApi = {
  listar: async (params: {
    search?: string;
    nivel?: NivelMCER | "";
    estado?: EstadoParticipante | "";
    page: number;
    limit: number;
  }) => {
    let query = supabase.from("participantes").select("*", { count: "exact" });

    if (params.search) query = query.ilike("nombre", `%${params.search}%`);
    if (params.nivel) query = query.eq("nivel_mcer", params.nivel);
    if (params.estado) query = query.eq("estado", params.estado);

    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    
    query = query.range(from, to).order("orden_participacion", { ascending: true });

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);
    
    return { data: data as Participante[], total: count || 0 };
  },

  obtenerMetricas: async () => {
    // Obtenemos todos los estados para contarlos
    const { data, error } = await supabase.from("participantes").select("estado");
    if (error) throw new Error(error.message);

    return {
      total: data.length,
      activos: data.filter((p) => p.estado === "activo").length,
      clasificados: data.filter((p) => p.estado === "clasificado").length,
      eliminados: data.filter((p) => p.estado === "eliminado").length,
    };
  },

  crear: async (participante: Omit<Participante, "id" | "created_at" | "estado" | "orden_participacion">) => {
    // 1. Buscamos cuál es el número de orden más alto actualmente
    const { data: ultimo } = await supabase
      .from("participantes")
      .select("orden_participacion")
      .order("orden_participacion", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. Le sumamos 1 (si la tabla está vacía, empezará en 1)
    const nuevoOrden = (ultimo?.orden_participacion || 0) + 1;

    // 3. Insertamos al participante con su nuevo orden
    const { data, error } = await supabase
      .from("participantes")
      .insert([{ ...participante, estado: "activo", orden_participacion: nuevoOrden }])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  },

    actualizarOrden: async (id: string, nuevoOrden: number) => {
    const { error } = await supabase.from("participantes").update({ orden_participacion: nuevoOrden }).eq("id", id);
    if (error) throw new Error(error.message);
  },

  intercambiarOrden: async (id1: string, orden1: number, id2: string, orden2: number) => {
    const { error: e1 } = await supabase.from("participantes").update({ orden_participacion: orden2 }).eq("id", id1);
    const { error: e2 } = await supabase.from("participantes").update({ orden_participacion: orden1 }).eq("id", id2);
    if (e1 || e2) throw new Error("Error al actualizar el orden");
  },
};