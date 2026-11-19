import { useQuery } from "@tanstack/react-query";
import { historialApi } from "../api/historial";
import { Activity } from "lucide-react";

export function HistorialActividad() {
  const { data: eventos, isLoading } = useQuery({
    queryKey: ["historial"],
    queryFn: historialApi.listar,
    refetchInterval: 2000,
  });

  const getColor = (tipo: string) => {
    switch (tipo) {
      case "voto": return "var(--patina)";
      case "ronda": return "var(--gold)";
      case "alerta": return "var(--vermilion)";
      default: return "var(--muted)";
    }
  };

  return (
    <div className="sb-panel p-6 flex flex-col h-[400px]">
      <h2 className="text-lg font-semibold sb-champagne mb-4 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <Activity size={18} className="text-[var(--gold)] ml-1" />
        Historial en Vivo
      </h2>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {isLoading ? (
          <p className="text-sm text-[var(--muted)] text-center">Cargando eventos...</p>
        ) : eventos?.length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center">No hay actividad registrada.</p>
        ) : (
          eventos?.map((ev) => (
            <div key={ev.id} className="flex gap-3 text-sm border-l-2 pl-3 py-1" style={{ borderColor: getColor(ev.tipo) }}>
              <span className="text-[10px] text-[var(--faint)] font-mono mt-1 whitespace-nowrap">
                {new Date(ev.created_at).toLocaleTimeString()}
              </span>
              <span className="text-[var(--champagne)]">{ev.mensaje}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}