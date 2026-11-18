import { useCallback, useEffect, useState } from "react";

const TTS_LANG = "en-US";
const TTS_RATE = 0.85;

export function useSpeech(texto: string) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const soportado =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Cancelar al cambiar de palabra o desmontar
  useEffect(() => {
    setReproduciendo(false);
    return () => {
      if (soportado) window.speechSynthesis.cancel();
    };
  }, [texto, soportado]);

  const pronunciar = useCallback(() => {
    if (!soportado || reproduciendo) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(texto);
    utter.lang = TTS_LANG;
    utter.rate = TTS_RATE;
    utter.pitch = 1;
    utter.onstart = () => setReproduciendo(true);
    utter.onend = () => setReproduciendo(false);
    utter.onerror = () => setReproduciendo(false);

    window.speechSynthesis.speak(utter);
  }, [soportado, reproduciendo, texto]);

  return { pronunciar, reproduciendo, soportado };
}