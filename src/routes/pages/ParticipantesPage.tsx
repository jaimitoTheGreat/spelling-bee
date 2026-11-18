import { useState, useDeferredValue } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { participantesApi } from "../../api/participantes";
import { participanteSchema, type ParticipanteForm } from "../../schemas/participante";
import type { NivelMCER, EstadoParticipante } from "../../types";

const LIMIT = 10;

export function ParticipantesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filtroNivel, setFiltroNivel] = useState<NivelMCER | "">("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoParticipante | "">("");
  
  const deferredSearch = useDeferredValue(search);

  const { data: metricas } = useQuery({
    queryKey: ["participantes-metricas"],
    queryFn: participantesApi.obtenerMetricas,
  });

  const { data: lista, isLoading } = useQuery({
    queryKey: ["participantes", deferredSearch, filtroNivel, filtroEstado, page],
    queryFn: () => participantesApi.listar({
      search: deferredSearch,
      nivel: filtroNivel,
      estado: filtroEstado,
      page,
      limit: LIMIT,
    }),
  });

  const { register, handleSubmit, reset} = useForm<ParticipanteForm>({
    resolver: zodResolver(participanteSchema),
    defaultValues: { nivel_mcer: "B1" }
  });

  const crearMutation = useMutation({
    mutationFn: participantesApi.crear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participantes"] });
      queryClient.invalidateQueries({ queryKey: ["participantes-metricas"] });
      reset();
    },
  });

  const intercambiarMutation = useMutation({
    mutationFn: ({ id1, orden1, id2, orden2 }: any) => participantesApi.intercambiarOrden(id1, orden1, id2, orden2),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["participantes"] }),
  });

  const onSubmit = (data: ParticipanteForm) => crearMutation.mutate(data);

  const mover = (index: number, direccion: -1 | 1) => {
    if (!lista?.data) return;
    const actual = lista.data[index];
    const vecino = lista.data[index + direccion];
    
    if (vecino) {
      intercambiarMutation.mutate({
        id1: actual.id,
        orden1: actual.orden_participacion || index + 1,
        id2: vecino.id,
        orden2: vecino.orden_participacion || index + 2,
      });
    }
  };

  const totalPages = lista?.total ? Math.ceil(lista.total / LIMIT) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="sb-display text-3xl sb-champagne">Participantes</h1>
        <p className="sb-mono sb-faint mt-1">Gestión de alumnos registrados</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: metricas?.total, color: "var(--champagne)" },
          { label: "Activos", value: metricas?.activos, color: "var(--patina)" },
          { label: "Clasificados", value: metricas?.clasificados, color: "var(--gold)" },
          { label: "Eliminados", value: metricas?.eliminados, color: "var(--vermilion)" },
        ].map((m) => (
          <div key={m.label} className="sb-panel p-4">
            <p className="sb-mono sb-faint">{m.label}</p>
            <p className="text-3xl font-bold mt-1" style={{ color: m.color }}>{m.value ?? "-"}</p>
          </div>
        ))}
      </div>

      <div className="sb-panel p-6">
        <h2 className="text-lg font-semibold sb-champagne mb-4">Registrar Participante</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-3 items-start w-full">
          <input {...register("nombre")} className="sb-input flex-1 min-w-[150px]" placeholder="Nombre completo" />
          <input {...register("institucion")} className="sb-input flex-1 min-w-[150px]" placeholder="Institución / Plantel" />
          <select {...register("nivel_mcer")} className="sb-input w-full md:w-32">
            {["A1", "A2", "B1", "B2", "C1", "C2"].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button type="submit" className="sb-btn sb-btn-primary w-full md:w-auto whitespace-nowrap" disabled={crearMutation.isPending}>
            {crearMutation.isPending ? "Guardando..." : "Registrar"}
          </button>
        </form>
      </div>

      <div className="sb-panel">
        <div className="p-4 border-b border-[var(--rule)] flex flex-col md:flex-row gap-3">
          <input type="text" placeholder="Buscar por nombre..." className="sb-input flex-1 min-w-[200px]" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className="sb-input w-full md:w-48" value={filtroNivel} onChange={(e) => { setFiltroNivel(e.target.value as NivelMCER); setPage(1); }}>
            <option value="">Todos los niveles</option>
            {["A1", "A2", "B1", "B2", "C1", "C2"].map(n => <option key={n} value={n}>Nivel {n}</option>)}
          </select>
          <select className="sb-input w-full md:w-48" value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value as EstadoParticipante); setPage(1); }}>
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="clasificado">Clasificados</option>
            <option value="eliminado">Eliminados</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--deep)] border-b border-[var(--rule)]">
              <tr>
                <th className="p-4 sb-mono text-[var(--faint)] font-normal text-center">Orden</th>
                <th className="p-4 sb-mono text-[var(--faint)] font-normal">Nombre</th>
                <th className="p-4 sb-mono text-[var(--faint)] font-normal">Institución</th>
                <th className="p-4 sb-mono text-[var(--faint)] font-normal">Nivel</th>
                <th className="p-4 sb-mono text-[var(--faint)] font-normal">Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-[var(--muted)]">Cargando...</td></tr>
              ) : lista?.data.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-[var(--muted)]">No se encontraron participantes.</td></tr>
              ) : (
                lista?.data.map((p, index) => (
                  <tr key={p.id} className="border-b border-[var(--rule)] last:border-0 hover:bg-[var(--deep)]/50">
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <button onClick={() => mover(index, -1)} disabled={index === 0} className="text-[var(--muted)] hover:text-[var(--gold)] disabled:opacity-30">▲</button>
                        <span className="text-xs font-mono">{p.orden_participacion || index + 1}</span>
                        <button onClick={() => mover(index, 1)} disabled={index === lista.data.length - 1} className="text-[var(--muted)] hover:text-[var(--gold)] disabled:opacity-30">▼</button>
                      </div>
                    </td>
                    <td className="p-4 font-semibold sb-champagne">{p.nombre}</td>
                    <td className="p-4 sb-muted">{p.institucion}</td>
                    <td className="p-4 font-mono">{p.nivel_mcer}</td>
                    <td className="p-4">
                      <span className={`sb-chip ${p.estado === 'activo' ? 'sb-chip-patina' : p.estado === 'clasificado' ? 'sb-chip-gold' : ''}`}>{p.estado}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[var(--rule)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)]">
            <strong>Activo:</strong> En competencia. <strong>Clasificado:</strong> Pasó a la siguiente ronda. <strong>Eliminado:</strong> Fuera del concurso.
          </p>
          <div className="flex items-center gap-2">
            <button className="sb-btn sb-btn-secondary sb-btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <span className="text-sm font-mono text-[var(--champagne)]">{page} / {totalPages}</span>
            <button className="sb-btn sb-btn-secondary sb-btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}