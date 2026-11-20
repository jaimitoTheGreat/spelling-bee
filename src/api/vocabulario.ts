import { supabase } from "../lib/supabase";
import type{ Palabra, NivelDificultad } from "../types";

export const vocabularioApi = {
  listar: async (params: {
    search?: string;
    nivel?: NivelDificultad| "";
    page: number;
    limit: number;
  }) => {
    let query = supabase.from("vocabulario").select("*", { count: "exact" });

    if (params.search) query = query.ilike("palabra", `%${params.search}%`);
    if (params.nivel) query = query.eq("nivel_mcer", params.nivel);

    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    
    query = query.range(from, to).order("created_at", { ascending: false });

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);
    
    return { data: data as Palabra[], total: count || 0 };
  },

  obtenerMetricas: async () => {
    const { data, error } = await supabase.from("vocabulario").select("usado");
    if (error) throw new Error(error.message);

    return {
      total: data.length,
      usadas: data.filter((v) => v.usado).length,
      sinUsar: data.filter((v) => !v.usado).length,
    };
  },

  crear: async (palabra: Omit<Palabra, "id" | "created_at" | "usado">) => {
    const { error } = await supabase.from("vocabulario").insert([{ ...palabra, usado: false }]);
    if (error) throw new Error(error.message);
  },

  importar: async (lista: Omit<Palabra, "id" | "created_at" | "usado">[]) => {
    const { error } = await supabase.from("vocabulario").insert(lista.map(p => ({ ...p, usado: false })));
    if (error) throw new Error(error.message);
  },
};