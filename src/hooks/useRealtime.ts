import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Nos suscribimos a los cambios en tiempo real de las tablas clave
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "estado_concurso" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["estado-concurso"] });
          queryClient.invalidateQueries({ queryKey: ["estado-concurso-juez"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "evaluaciones" }, // Escuchamos los votos
        () => {
          // Forzamos la actualización de los votos y las clasificaciones
          queryClient.invalidateQueries({ queryKey: ["votos-turno"] });
          queryClient.invalidateQueries({ queryKey: ["mi-voto"] });
          queryClient.invalidateQueries({ queryKey: ["clasificacion"] });
        }
      )
      // Dentro del useEffect de useRealtime, agrega este .on()
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "historial_eventos" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["historial"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}