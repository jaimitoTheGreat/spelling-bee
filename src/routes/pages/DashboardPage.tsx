import { MonitorPlay, Skull, Play, Square, RotateCcw, Volume2, Download, AlertTriangle, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { evaluacionApi } from "../../api/evaluacion";
import { participantesApi } from "../../api/participantes";
import { vocabularioApi } from "../../api/vocabulario";
import { juecesApi } from "../../api/jueces";
import { resultadosApi } from "../../api/resultados";
import { HistorialActividad } from "../../components/HistorialActividad";
import { reproducirPalabra } from "../../utils/audio";
import { useState } from "react";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [participanteSel, setParticipanteSel] = useState("");
  const [palabraSel, setPalabraSel] = useState("");

  const { data: estado, isLoading } = useQuery({
    queryKey: ["estado-concurso"],
    queryFn: evaluacionApi.obtenerEstado,
  });

  const { data: participantes } = useQuery({
    queryKey: ["participantes-ordenados"],
    queryFn: () => participantesApi.listar({ estado: "activo", page: 1, limit: 50 }),
  });

  const { data: palabras } = useQuery({
    queryKey: ["vocabulario-sin-usar"],
    queryFn: () => vocabularioApi.listar({ page: 1, limit: 50 }),
  });

  const { data: jueces } = useQuery({
    queryKey: ["jueces-activos"],
    queryFn: juecesApi.listar,
  });
  
  const { data: votosTurno } = useQuery({
    queryKey: ["votos-turno", estado?.palabra_actual_id],
    queryFn: () => evaluacionApi.obtenerVotosTurno(estado!.palabra_actual_id!),
    enabled: !!estado?.palabra_actual_id && estado.votacion_abierta,
    refetchInterval: 1000, 
  });

  const { data: clasificacion } = useQuery({
    queryKey: ["clasificacion"],
    queryFn: resultadosApi.obtenerTablaClasificacion,
    refetchInterval: 3000,
  });

  const iniciarMutation = useMutation({
    mutationFn: () => evaluacionApi.iniciarTurno(participanteSel, palabraSel),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["estado-concurso"] }),
  });

  const finalizarMutation = useMutation({
    mutationFn: evaluacionApi.finalizarTurno,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["estado-concurso"] }),
  });

  const avanzarMutation = useMutation({
    mutationFn: evaluacionApi.avanzarTurno,
    onSuccess: () => {
      queryClient.setQueryData(["estado-concurso"], (old: any) => ({
        ...old, participante_actual_id: null, palabra_actual_id: null, votacion_abierta: false
      }));
      queryClient.invalidateQueries({ queryKey: ["estado-concurso"] });
      queryClient.invalidateQueries({ queryKey: ["participantes-ordenados"] });
      queryClient.invalidateQueries({ queryKey: ["clasificacion"] });
    },
  });

  const cambiarRondaMutation = useMutation({
    mutationFn: ({ ronda, tipo }: { ronda: number, tipo: "regular" | "muerte_subita" }) => evaluacionApi.cambiarRonda(ronda, tipo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["estado-concurso"] }),
  });

  const reiniciarMutation = useMutation({
    mutationFn: evaluacionApi.reiniciarTurno,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["estado-concurso"] }),
  });

  const toggleJuezMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string, estado: "activo" | "inactivo" }) => juecesApi.toggleEstado(id, estado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jueces-activos"] }),
  });

  if (isLoading) return <div className="p-6 sb-mono">Cargando...</div>;

  const juecesActivos = jueces?.filter(j => j.estado === "activo") || [];
  const votosRecibidos = votosTurno?.length || 0;
  const votacionCompleta = votosRecibidos >= juecesActivos.length && juecesActivos.length > 0;
  
  const enEspera = !estado?.participante_actual_id;
  const enTurno = estado?.participante_actual_id && !estado?.votacion_abierta;
  const enMuerteSubita = estado?.tipo_ronda === "muerte_subita";

  const idsQueYaVotaron = votosTurno?.map(v => v.juez_id) || [];
  const juecesFaltantes = juecesActivos.filter(j => !idsQueYaVotaron.includes(j.id));

  let hayEmpateLider = false;
  if (clasificacion && clasificacion.length >= 2) {
    hayEmpateLider = clasificacion[0].puntajeTotal > 0 && clasificacion[0].puntajeTotal === clasificacion[1].puntajeTotal;
  }

  const exportarCSV = () => {
    if (!clasificacion || clasificacion.length === 0) return;
    const headers = ["Posicion", "Nombre", "Institucion", "Nivel", "Puntos Totales"];
    const filas = clasificacion.map((res, idx) => [idx + 1, res.participante.nombre, res.participante.institucion, res.participante.nivel_mcer, res.puntajeTotal]);
    const csvContent = [headers, ...filas].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `resultados_spelling_bee_${estado?.tipo_ronda}_${estado?.ronda_actual}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h1 className="sb-display text-3xl sb-champagne">Control de Turnos</h1>
          <p className="sb-mono sb-faint mt-1">Panel General en Tiempo Real</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/proyeccion" target="_blank" rel="noreferrer" className="sb-btn sb-btn-secondary sb-btn-sm flex-1 sm:flex-none">
            <MonitorPlay size={16} className="mr-2"/>
            Proyección
          </a>
          <button className={`sb-btn ${estado?.tipo_ronda === 'regular' ? 'sb-btn-primary' : 'sb-btn-secondary'} sb-btn-sm flex-1 sm:flex-none`} onClick={() => cambiarRondaMutation.mutate({ ronda: estado?.ronda_actual || 1, tipo: "regular" })}>Ronda {estado?.ronda_actual || 1}</button>
          <button className={`sb-btn ${enMuerteSubita ? 'sb-btn-primary' : 'sb-btn-secondary'} sb-btn-sm flex-1 sm:flex-none`} onClick={() => cambiarRondaMutation.mutate({ ronda: estado?.ronda_actual || 1, tipo: "muerte_subita" })}>
            <Skull size={16} className="mr-2"/>
            Muerte Súbita
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
          <div className="sb-panel p-6 space-y-4">
            {enEspera ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold sb-champagne flex items-center">
                  <Play size={18} className="mr-2 text-[var(--gold)]"/>
                  Iniciar Turno
                </h2>
                <select className="sb-input" value={participanteSel} onChange={e => setParticipanteSel(e.target.value)}>
                  <option value="">Selecciona participante...</option>
                  {participantes?.data.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <select className="sb-input" value={palabraSel} onChange={e => setPalabraSel(e.target.value)}>
                  <option value="">Selecciona palabra...</option>
                  {palabras?.data.map(p => <option key={p.id} value={p.id}>{p.palabra} ({p.nivel_mcer})</option>)}
                </select>
                <button className="sb-btn sb-btn-primary w-full" disabled={!participanteSel || !palabraSel} onClick={() => iniciarMutation.mutate()}>
                  <Play size={16} className="mr-2"/> Iniciar Turno
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="sb-inset p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="sb-mono sb-faint">Alumno en turno</p>
                    <p className="text-xl font-bold sb-champagne">{estado?.participante?.nombre}</p>
                    <p className="text-xl font-bold sb-gold mt-2">{estado?.palabra?.palabra}</p>
                  </div>
                  <button 
                    onClick={() => reproducirPalabra(estado!.palabra!.palabra, estado!.palabra!.audio_url)} 
                    className="sb-btn sb-btn-secondary sb-btn-sm w-full sm:w-auto"
                  >
                    <Volume2 size={16} className="mr-2"/>
                    Escuchar
                  </button>
                </div>

                {enTurno ? (
                  <button className="sb-btn sb-btn-secondary w-full" onClick={() => finalizarMutation.mutate()}>
                    <Square size={16} className="mr-2"/> Finalizar Voto
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded border ${votacionCompleta ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                      <p className={`text-sm font-bold flex items-center gap-2 ${votacionCompleta ? 'text-green-500' : 'text-red-500'}`}>
                        {votacionCompleta ? <><CheckCircle2 size={16}/> Votación 100% completada</> : <><Lock size={16}/> Bloqueo de avance activo</>}
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-1">Votos: {votosRecibidos} / {juecesActivos.length}</p>
                      {!votacionCompleta && juecesFaltantes.length > 0 && <p className="text-xs text-[var(--vermilion)] mt-2">Faltan: {juecesFaltantes.map(j => j.nombre).join(", ")}</p>}
                    </div>
                    <button className="sb-btn sb-btn-primary w-full" disabled={!votacionCompleta || avanzarMutation.isPending} onClick={() => avanzarMutation.mutate()}>
                      Siguiente Turno <ArrowRight size={16} className="ml-2"/>
                    </button>
                  </div>
                )}

                <button 
                  className="sb-btn sb-btn-secondary w-full text-[var(--vermilion)] border-[var(--vermilion)] mt-2" 
                  onClick={() => {
                    if(confirm("¿Seguro que quieres reiniciar el turno? Se borrarán los votos actuales.")) reiniciarMutation.mutate();
                  }}
                >
                  <RotateCcw size={16} className="mr-2"/> Reiniciar Turno
                </button>
              </div>
            )}
          </div>

          {/* Lista de jueces */}
          <div className="sb-panel p-6">
            <h2 className="text-lg font-semibold sb-champagne mb-4">Jueces en Sala</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {jueces?.map(j => (
                <div key={j.id} className="flex justify-between items-center bg-[var(--deep)] p-3 rounded border border-[var(--rule)]">
                  <span className="text-sm text-[var(--champagne)]">{j.nombre}</span>
                  <button onClick={() => toggleJuezMutation.mutate({ id: j.id, estado: j.estado === 'activo' ? 'inactivo' : 'activo' })} className={`sb-chip ${j.estado === 'activo' ? 'sb-chip-patina' : ''}`}>
                    {j.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          <div className="sb-panel p-6 flex flex-col items-center justify-center min-h-[200px]">
             <h2 className="text-lg font-semibold sb-champagne mb-4">Resultados del Turno</h2>
             {votosRecibidos > 0 ? (
               <div className="text-center">
                 <p className="sb-display text-6xl sb-gold">{(votosTurno!.reduce((acc, v) => acc + Object.values(v.criterios).reduce((a, b) => a + b, 0), 0) / votosRecibidos).toFixed(1)}</p>
                 <p className="text-sm text-[var(--muted)] mt-2">Promedio de {votosRecibidos} jueces</p>
               </div>
             ) : (
               <p className="text-sm text-[var(--muted)]">Sin votos registrados.</p>
             )}
          </div>

          <div className="sb-panel p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold sb-champagne">Clasificación</h2>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {hayEmpateLider && (
                  <button className="sb-btn sb-btn-primary animate-pulse sb-btn-sm flex-1 sm:flex-none" onClick={() => cambiarRondaMutation.mutate({ ronda: (estado?.ronda_actual || 1) + 1, tipo: "muerte_subita" })}>
                    <Skull size={16} className="mr-2"/> Desempate
                  </button>
                )}
                <button onClick={exportarCSV} className="sb-btn sb-btn-secondary sb-btn-sm flex-1 sm:flex-none">
                  <Download size={16} className="mr-2"/> CSV
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="border-b border-[var(--rule)]">
                  <tr>
                    <th className="p-2 sb-mono text-[var(--faint)]">Pos</th>
                    <th className="p-2 sb-mono text-[var(--faint)]">Participante</th>
                    <th className="p-2 sb-mono text-[var(--faint)] text-right">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {clasificacion?.map((res, idx) => {
                    const esEmpate = hayEmpateLider && idx < 2;
                    return (
                      <tr key={res.participante.id} className={`border-b border-[var(--rule)] ${esEmpate ? 'bg-[var(--vermilion)]/10' : ''}`}>
                        <td className="p-2 font-mono font-bold">{idx + 1}</td>
                        <td className="p-2 font-semibold sb-champagne">
                          {res.participante.nombre}
                          {esEmpate && <span className="ml-2 text-xs text-[var(--vermilion)] inline-flex items-center gap-1"><AlertTriangle size={12}/> Empate</span>}
                        </td>
                        <td className="p-2 text-right font-bold sb-gold">{res.puntajeTotal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <HistorialActividad />
        </div>
      </div>
    </div>
  );
}