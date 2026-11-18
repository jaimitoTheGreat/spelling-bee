import { supabase } from "../lib/supabase";
import type { EstadoConcurso, Participante, Palabra, Evaluacion } from "../types";

export const evaluacionApi = {
  // ─── Para el Organizador y el Juez ───
  obtenerEstado: async () => {
    const { data, error } = await supabase
      .from("estado_concurso")
      .select(`
        *,
        participante:participantes(*),
        palabra:vocabulario(*)
      `)
      .eq("id", 1)
      .single();
    
    if (error) throw new Error(error.message);
    return data as EstadoConcurso & { participante: Participante | null; palabra: Palabra | null };
  },

  // ─── Para el Organizador ───
  iniciarTurno: async (participanteId: string, palabraId: string) => {
    // 1. Cambiamos el estado (bloquea votación)
    const { error: errEstado } = await supabase
      .from("estado_concurso")
      .update({ participante_actual_id: participanteId, palabra_actual_id: palabraId, votacion_abierta: false })
      .eq("id", 1);
    if (errEstado) throw new Error(errEstado.message);

    // 2. Marcamos la palabra como usada
    const { error: errPalabra } = await supabase
      .from("vocabulario")
      .update({ usado: true })
      .eq("id", palabraId);
    if (errPalabra) throw new Error(errPalabra.message);

    // 3. Limpiamos votos anteriores de esa palabra por si acaso
    await supabase.from("evaluaciones").delete().eq("palabra_id", palabraId);
  },

  finalizarTurno: async () => {
    const { error } = await supabase
      .from("estado_concurso")
      .update({ votacion_abierta: true })
      .eq("id", 1);
    if (error) throw new Error(error.message);
  },

  // ─── Para el Juez ───
    obtenerMiVoto: async (juezId: string, participanteId: string) => {
        const { data, error } = await supabase
        .from("evaluaciones")
        .select("*")
        .eq("juez_id", juezId)
        .eq("participante_id", participanteId) // <-- Filtramos por el turno actual
        .maybeSingle(); // <-- maybeSingle permite 0 o 1 fila sin lanzar error 406
        
        if (error) throw new Error(error.message);
        return data as Evaluacion | null;
    },

    guardarVoto: async (voto: Omit<Evaluacion, "id" | "created_at">) => {
        const { error } = await supabase.from("evaluaciones").upsert(
        [{ 
            juez_id: voto.juez_id, 
            participante_id: voto.participante_id, 
            palabra_id: voto.palabra_id, 
            criterios: voto.criterios, 
            enviado: voto.enviado 
        }], 
        { onConflict: "juez_id, participante_id" } 
        );
        
        if (error) {
        console.error("Error de Supabase al guardar voto:", error);
        throw new Error(error.message);
        }
    },
    obtenerVotosTurno: async (palabraId: string) => {
    const { data, error } = await supabase
      .from("evaluaciones")
      .select("*")
      .eq("palabra_id", palabraId);
    if (error) throw new Error(error.message);
    return data as Evaluacion[];
  },

    registrarEvento: async (mensaje: string, tipo: string = 'info') => {
    await supabase.from("historial_eventos").insert([{ mensaje, tipo }]);
  },

  avanzarTurno: async () => {
    const { error } = await supabase.rpc("avanzar_turno");
    if (error) throw new Error(error.message);
    await supabase.from("historial_eventos").insert([{ mensaje: "El organizador avanzó al siguiente turno", tipo: "ronda" }]);
  },

  cambiarRonda: async (ronda: number, tipo: "regular" | "muerte_subita") => {
    const { error } = await supabase
      .from("estado_concurso")
      .update({ ronda_actual: ronda, tipo_ronda: tipo })
      .eq("id", 1);
    if (error) throw new Error(error.message);
  },

  reiniciarTurno: async () => {
    // 1. Obtenemos el estado actual para saber a quién borrarle los votos
    const { data: estado } = await supabase.from("estado_concurso").select("*").eq("id", 1).single();
    
    if (estado?.participante_actual_id) {
      // 2. Borramos los votos emitidos para este participante
      await supabase.from("evaluaciones").delete().eq("participante_id", estado.participante_actual_id);
      
      // 3. Cerramos la votación (volvemos a bloquear)
      await supabase.from("estado_concurso").update({ votacion_abierta: false }).eq("id", 1);
      
      // 4. Registramos en el historial
      await supabase.from("historial_eventos").insert([{ mensaje: "Turno reiniciado. Votos borrados.", tipo: "alerta" }]);
    }
  },
};