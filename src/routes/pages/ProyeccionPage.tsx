import { useQuery } from "@tanstack/react-query";
import { evaluacionApi } from "../../api/evaluacion";
import { reproducirPalabra } from "../../utils/audio";
import { useState, useEffect, useRef } from "react";

export function ProyeccionPage() {
  const { data: estado } = useQuery({
    queryKey: ["estado-concurso-juez"],
    queryFn: evaluacionApi.obtenerEstado,
    refetchInterval: 1000,
  });

  const [countdown, setCountdown] = useState<number | null>(null);
  const [audioDesbloqueado, setAudioDesbloqueado] = useState(false);
  const ultimoTurnoId = useRef<string | null>(null);

  // 1. Desbloquear el audio al primer clic (Requisito de los navegadores)
  const desbloquearAudio = () => {
    if (!audioDesbloqueado) {
      const utter = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(utter); // Reproduce algo vacío para dar permiso
      setAudioDesbloqueado(true);
    }
  };

  // 2. Control de la cuenta atrás
  useEffect(() => {
    if (estado?.participante_actual_id && !estado.votacion_abierta) {
      // Solo reiniciamos el contador si es un turno nuevo o se reinició
      if (ultimoTurnoId.current !== estado.updated_at) {
        setCountdown(5);
        ultimoTurnoId.current = estado.updated_at;
      }
    } else {
      setCountdown(null);
    }
  }, [estado?.participante_actual_id, estado?.votacion_abierta, estado?.updated_at]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // 3. AL LLEGAR A CERO: Reproducción automática
      if (estado?.palabra) {
        reproducirPalabra(estado.palabra.palabra, estado.palabra.audio_url);
      }
    }
  }, [countdown, estado?.palabra]);

  if (!estado?.participante_actual_id) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--lacquer)]">
        <h1 className="sb-display text-5xl sb-champagne animate-pulse">Preparando siguiente turno...</h1>
      </div>
    );
  }

  return (
    // El onClick en el div principal desbloquea el audio en la primera interacción
    <div className="flex h-screen flex-col bg-[var(--lacquer)] p-8" onClick={desbloquearAudio}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <h1 className="sb-display text-3xl md:text-4xl lg:text-5xl sb-champagne">Spelling Bee <span className="sb-gold">Nova</span></h1>
        <div className="sb-chip sb-chip-patina text-sm md:text-base">Ronda {estado.ronda_actual}</div>
      </div>

      {/* Contenido Principal */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-24 w-24 md:h-32 md:w-32 items-center justify-center rounded-md text-3xl md:text-5xl font-black mb-6 md:mb-8" style={{ background: "var(--gold)", color: "var(--ink)" }}>
          {estado.participante?.nombre.substring(0, 2).toUpperCase()}
        </div>
        
        {/* Nombre del alumno responsivo */}
        <h2 className="sb-display text-5xl md:text-7xl lg:text-8xl xl:text-9xl sb-champagne mb-4 leading-tight">
          {estado.participante?.nombre}
        </h2>
        
        <p className="text-lg md:text-2xl lg:text-3xl sb-muted mb-8 md:mb-12">
          {estado.participante?.institucion} · Nivel {estado.participante?.nivel_mcer}
        </p>

        {!estado.votacion_abierta ? (
          <div className="space-y-8 w-full max-w-4xl">
            {countdown !== null && countdown > 0 ? (
              <div className="space-y-6 animate-pulse">
                <p className="text-5xl md:text-7xl lg:text-9xl text-[var(--vermilion)] font-black tracking-tighter">🔇 GUARDEN SILENCIO</p>
                <p className="text-3xl md:text-5xl text-[var(--champagne)] font-semibold">Comenzando en {countdown}...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-4xl md:text-6xl lg:text-7xl text-[var(--patina)] font-bold animate-pulse">
                  🎤 Escuchando...
                </p>
                {/* Botón grande solo para tablets/celulares */}
                <button onClick={() => reproducirPalabra(estado.palabra!.palabra, estado.palabra!.audio_url)} className="sb-btn sb-btn-secondary text-xl px-8 py-4">
                  🔊 Repetir Audio
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-4xl md:text-6xl lg:text-7xl text-[var(--patina)] font-semibold animate-pulse">
              El jurado está deliberando...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}