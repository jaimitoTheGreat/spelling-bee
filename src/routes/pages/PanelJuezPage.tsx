import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { evaluacionApi } from "../../api/evaluacion";
import { CRITERIOS } from "../../types";
import { reproducirPalabra } from "../../utils/audio";
import { historialApi } from "../../api/historial";

export function PanelJuezPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  
  const [puntos, setPuntos] = useState<Record<string, number>>({});
  const [editando, setEditando] = useState(false);

  // Consultar estado del concurso (se recarga cada 2s para estar sincronizado)
  const { data: estado, isLoading } = useQuery({
    queryKey: ["estado-concurso-juez"],
    queryFn: evaluacionApi.obtenerEstado,
    refetchInterval: 2000, 
  });

  // Consultar si este juez ya votó
    const { data: miVoto } = useQuery({
    queryKey: ["mi-voto", user?.id, estado?.participante_actual_id],
    queryFn: () => evaluacionApi.obtenerMiVoto(user!.id, estado!.participante_actual_id!),
    enabled: !!user?.id && !!estado?.participante_actual_id,
  });

    // 1. Cuando cambia el participante, limpiamos la pizarra
  useEffect(() => {
    setPuntos({});
    setEditando(false);
  }, [estado?.participante_actual_id]);

  // 2. Cuando llega el voto de la BD, lo cargamos SOLO si no estamos editando
    useEffect(() => {
    // Si hay votación y existe un voto guardado, lo mostramos
    if (miVoto && !editando) {
      setPuntos(miVoto.criterios);
    } 
    // Si la votación se cierra o se reinicia (votacion_abierta pasa a false), limpiamos la pantalla
    else if (!estado?.votacion_abierta) {
      setPuntos({});
      setEditando(false);
    }
  }, [miVoto, editando, estado?.votacion_abierta]);

  // 1. Agrega este estado al inicio del componente
const [errorMsg, setErrorMsg] = useState("");

// 2. Actualiza tu enviarMutation para que capture el error
  const enviarMutation = useMutation({
    mutationFn: () => evaluacionApi.guardarVoto({
      juez_id: user!.id,
      participante_id: estado!.participante_actual_id!,
      palabra_id: estado!.palabra_actual_id!,
      criterios: puntos,
      enviado: true,
    }),
    onSuccess: async () => {
      await historialApi.registrar(`Juez ${user?.nombre} emitió su voto para ${estado?.participante?.nombre}`, "voto");
      queryClient.invalidateQueries({ queryKey: ["mi-voto"] });
      setEditando(false);
    },
    onError: (error: any) => {
      console.error(error);
      setErrorMsg(error.message || "Error al guardar el voto");
    }
  });

  const reproducirAudio = () => {
    if (!estado?.palabra) return;
    if (estado.palabra.audio_url) {
      new Audio(estado.palabra.audio_url).play();
    } else {
      const utter = new SpeechSynthesisUtterance(estado.palabra.palabra);
      utter.lang = "en-US";
      utter.rate = 0.85;
      window.speechSynthesis.speak(utter);
    }
  };

  if (isLoading) return <div className="p-6 sb-mono text-center">Conectando con la mesa de control...</div>;

  if (!estado?.participante_actual_id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="sb-display text-3xl sb-champagne mb-2">Esperando Turno</h1>
        <p className="text-[var(--muted)] mb-6">El organizador aún no ha iniciado la participación.</p>
        <button onClick={logout} className="sb-btn sb-btn-secondary">Salir</button>
      </div>
    );
  }

  const abierta = estado.votacion_abierta;
  const votado = miVoto?.enviado && !editando;
  const totalSel = Object.values(puntos).reduce((a, b) => a + b, 0);
  const completa = CRITERIOS.every(([id]) => puntos[id] !== undefined);

    return (
    <div className="min-h-screen bg-[var(--lacquer)] p-4 md:p-6 pb-24">
      <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-4xl mx-auto">
        <div>
          <h1 className="sb-display text-2xl md:text-3xl text-[var(--champagne)]">Panel del Juez</h1>
          <p className="sb-mono text-[var(--faint)] mt-1">Sesión de {user?.nombre}</p>
        </div>
        <button onClick={logout} className="sb-btn sb-btn-secondary sb-btn-sm w-full md:w-auto">Salir</button>
      </header>

      <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
        {/* Tarjeta del Alumno */}
        <div className="sb-panel space-y-4 p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-md text-xl font-bold" style={{ background: "var(--gold)", color: "var(--ink)" }}>
              {estado.participante?.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold sb-champagne leading-tight">{estado.participante?.nombre}</p>
              <p className="text-xs sb-muted mt-1">{estado.participante?.institucion}</p>
            </div>
          </div>

          <div className="sb-inset p-4 relative">
            <p className="sb-mono sb-faint">Palabra a evaluar</p>
            <div className="flex justify-between items-center mt-2">
              <div>
                <p className="sb-display text-4xl md:text-5xl sb-gold">{estado.palabra?.palabra}</p>
                <p className="text-sm font-mono text-[var(--muted)] mt-1">{estado.palabra?.ipa}</p>
              </div>
              <button 
                onClick={() => reproducirPalabra(estado.palabra!.palabra, estado.palabra!.audio_url)} 
                className="sb-btn sb-btn-secondary rounded-full h-12 w-12 p-0 text-xl shrink-0" 
                title="Escuchar pronunciación"
              >
                🔊
              </button>
            </div>
          </div>
          
          {!abierta ? (
            <p className="sb-inset p-3 text-xs text-[var(--vermilion)] text-center font-semibold border border-[var(--vermilion)]/30 bg-[var(--vermilion)]/5 rounded">
              🔒 El participante está deletreando. Votación bloqueada.
            </p>
          ) : (
            <p className="sb-inset p-3 text-xs text-[var(--patina)] text-center font-semibold border border-[var(--patina)]/30 bg-[var(--patina)]/5 rounded">
              ✅ Participación finalizada. Puedes emitir tu voto.
            </p>
          )}
        </div>

        {/* Rúbrica */}
        <div className="sb-panel space-y-5 p-5 md:p-6 flex flex-col justify-between">
          <div>
            <p className="sb-mono sb-faint mb-4">Rúbrica de evaluación · 0–3</p>
            
            {CRITERIOS.map(([id, nombre]) => (
              <div key={id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <span className="text-sm sb-champagne font-medium">{nombre}</span>
                <div className="flex gap-2 w-full sm:w-auto">
                  {[0, 1, 2, 3].map((p) => (
                    <button
                      key={p}
                      className={`sb-rubro flex-1 sm:flex-none ${puntos[id] === p ? "sb-rubro--sel" : ""}`}
                      disabled={!abierta || votado}
                      onClick={() => setPuntos({ ...puntos, [id]: p })}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between border-t pt-4 mb-4" style={{ borderColor: "var(--rule)" }}>
              <span className="text-sm sb-muted font-semibold">Total del voto</span>
              <span className="text-2xl font-bold sb-gold">{totalSel} / 9</span>
            </div>

            {votado ? (
              <div className="sb-inset flex items-center justify-between p-4 rounded-md" style={{ borderColor: "var(--patina)", background: "var(--patina)" + "10" }}>
                <span className="text-sm font-bold sb-patina">Voto enviado ✓</span>
                <button className="sb-link" onClick={() => setEditando(true)}>Editar voto</button>
              </div>
            ) : (
              <button
                className="sb-btn sb-btn-primary w-full text-lg h-14"
                disabled={!abierta || !completa || enviarMutation.isPending}
                onClick={() => enviarMutation.mutate()}
              >
                {enviarMutation.isPending ? "Guardando..." : "Enviar voto"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}