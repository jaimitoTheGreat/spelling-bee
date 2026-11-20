import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import { HistorialActividad } from "../components/HistorialActividad";

// Mockeamos la API del historial
const { mockHistorialApi } = vi.hoisted(() => ({
  mockHistorialApi: { listar: vi.fn() }
}));
vi.mock("../api/historial", () => ({ historialApi: mockHistorialApi }));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe("Historial de Actividad - PT-29", () => {
  it("debe mostrar los eventos cronológicos en la interfaz", async () => {
    // Simulamos la respuesta de la base de datos
    mockHistorialApi.listar.mockResolvedValue([
      { id: "1", mensaje: "Juez Elvira emitió su voto", tipo: "voto", created_at: new Date().toISOString() },
      { id: "2", mensaje: "El organizador avanzó al siguiente turno", tipo: "ronda", created_at: new Date().toISOString() }
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <HistorialActividad />
      </QueryClientProvider>
    );

    // Verificamos que el título esté
    expect(screen.getByText("Historial en Vivo")).toBeInTheDocument();
    
    // Verificamos que los eventos se hayan pintado
    const eventoVoto = await screen.findByText("Juez Elvira emitió su voto");
    const eventoRonda = await screen.findByText("El organizador avanzó al siguiente turno");
    
    expect(eventoVoto).toBeInTheDocument();
    expect(eventoRonda).toBeInTheDocument();
  });
});