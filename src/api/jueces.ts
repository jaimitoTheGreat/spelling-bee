import { supabase } from "../lib/supabase";
import type { Juez, RespuestaCreacionJuez } from "../types";

export const juecesApi = {
  listar: async (): Promise<Juez[]> => {
    const { data, error } = await supabase
      .from("jueces")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (error) throw new Error(error.message);
    return data as Juez[];
  },

  crear: async (nombre: string): Promise<RespuestaCreacionJuez> => {
    const { data, error } = await supabase.rpc("crear_juez", { nombre_input: nombre });
    
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error); // Maneja el límite de 5 jueces
    
    return { juez: data, codigo: data.codigo };
  },

  desactivar: async (id: string): Promise<void> => {
    const { error } = await supabase.rpc("desactivar_juez", { juez_id: id });
    if (error) throw new Error(error.message);
  },

  toggleEstado: async (id: string, nuevoEstado: "activo" | "inactivo") => {
    const { error } = await supabase.from("jueces").update({ estado: nuevoEstado }).eq("id", id);
    if (error) throw new Error(error.message);
  },
};