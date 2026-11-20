import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import { ProyeccionPage } from "../routes/pages/ProyeccionPage";

const { mockEvaluacionApi } = vi.hoisted(() => ({
  mockEvaluacionApi: { obtenerEstado: vi.fn() }
}));

vi.mock("../api/evaluacion", () => ({ evaluacionApi: mockEvaluacionApi }));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe("Pantalla Pública - PT-25", () => {
  it("debe mostrar el nombre del alumno pero OCULTAR el texto de la palabra", async () => {
    mockEvaluacionApi.obtenerEstado.mockResolvedValue({
      participante_actual_id: "1",
      palabra_actual_id: "2",
      votacion_abierta: false,
      ronda_actual: 1,
      updated_at: new Date().toISOString(),
      participante: { nombre: "Ana Sofía", institucion: "UNAM", nivel_mcer: "B1" },
      palabra: { palabra: "necessary", ipa: "/necesary/", audio_url: null },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProyeccionPage />
      </QueryClientProvider>
    );

    // 1. Verifica que el alumno SÍ se vea
    const nombre = await screen.findByText("Ana Sofía");
    expect(nombre).toBeInTheDocument();

    // 2. Verifica que la palabra "necessary" NO esté en pantalla
    const palabraOculta = screen.queryByText("necessary");
    expect(palabraOculta).not.toBeInTheDocument();
    
    // 3. Verifica que muestre el aviso de silencio inicial
    expect(screen.getByText(/GUARDEN SILENCIO/i)).toBeInTheDocument();
  });
});