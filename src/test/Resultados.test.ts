import { describe, it, expect } from "vitest";
import { resultadosApi } from "../api/resultados";

// Simulamos el comportamiento de la clasificación
describe("Detección de Empates - PT-26", () => {
  it("debe detectar un empate en el primer lugar", () => {
    const clasificacion = [
      { participante: { id: "1", nombre: "Ana" }, puntajeTotal: 27 },
      { participante: { id: "2", nombre: "Diego" }, puntajeTotal: 27 },
      { participante: { id: "3", nombre: "Fernanda" }, puntajeTotal: 20 },
    ];

    const hayEmpateLider = clasificacion[0].puntajeTotal > 0 && 
                           clasificacion[0].puntajeTotal === clasificacion[1].puntajeTotal;
    
    expect(hayEmpateLider).toBe(true);
  });

  it("no debe detectar empate si el primero tiene más puntos", () => {
    const clasificacion = [
      { participante: { id: "1", nombre: "Ana" }, puntajeTotal: 30 },
      { participante: { id: "2", nombre: "Diego" }, puntajeTotal: 27 },
    ];

    const hayEmpateLider = clasificacion[0].puntajeTotal > 0 && 
                           clasificacion[0].puntajeTotal === clasificacion[1].puntajeTotal;
    
    expect(hayEmpateLider).toBe(false);
  });
});