export function reproducirPalabra(texto: string, audioUrl?: string | null) {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(() => {
      // Si el audio de la BD falla, usamos el TTS
      usarTTS(texto);
    });
  } else {
    usarTTS(texto);
  }
}

function usarTTS(texto: string) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel(); // Corta cualquier audio previo
    const utter = new SpeechSynthesisUtterance(texto);
    utter.lang = "en-US";
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  } else {
    console.warn("Este navegador no soporta síntesis de voz.");
  }
}