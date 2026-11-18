import { supabase } from "../lib/supabase";
import type { Participante } from "../types";

export interface ResultadoParticipante {
  participante: Participante;
  puntajeTotal: number;
  rondasJugadas: number;
}

export const resultadosApi = {
  obtenerTablaClasificacion: async (): Promise<ResultadoParticipante[]> => {
    // 1. Traemos a todos los participantes
    const { data: participantes, error: errP } = await supabase
      .from("participantes")
      .select("*")
      .neq("estado", "eliminado");
    if (errP) throw new Error(errP.message);

    // 2. Traemos todas las evaluaciones
    const { data: evaluaciones, error: errE } = await supabase
      .from("evaluaciones")
      .select("*");
    if (errE) throw new Error(errE.message);

    // 3. Calculamos el total por participante
    const resultados = participantes.map((p) => {
      const votosDelAlumno = evaluaciones.filter((e) => e.participante_id === p.id);
      
      // Sumamos todos los puntos de todos los criterios de todos los votos
      const puntajeTotal = votosDelAlumno.reduce((acc, voto) => {
        const sumaVoto = Object.values(voto.criterios as Record<string, number>).reduce((a, b) => a + b, 0);
        return acc + sumaVoto;
      }, 0);

      // Contamos en cuántas rondas únicas participó
      const rondasUnicas = new Set(votosDelAlumno.map((v) => v.palabra_id)).size;

      return {
        participante: p,
        puntajeTotal,
        rondasJugadas: rondasUnicas,
      };
    });

    // 4. Ordenamos de mayor a menor
    return resultados.sort((a, b) => b.puntajeTotal - a.puntajeTotal);
  },
};