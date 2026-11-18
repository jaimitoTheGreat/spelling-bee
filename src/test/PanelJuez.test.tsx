import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PanelJuezPage } from "../routes/pages/PanelJuezPage";

// ✅ vi.hoisted se ejecuta ANTES de los imports, evitando el ReferenceError
const { mockEvaluacionApi } = vi.hoisted(() => {
  return {
    mockEvaluacionApi: {
      obtenerEstado: vi.fn(),
      obtenerMiVoto: vi.fn(),
      guardarVoto: vi.fn(),
    },
  };
});

// ✅ La fábrica ahora sí puede referenciar la variable hoisteada
vi.mock("../api/evaluacion", () => ({ evaluacionApi: mockEvaluacionApi }));
vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "1", nombre: "Juez", rol: "juez" },
    logout: vi.fn(),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe("Panel del Juez - Bloqueo de Votación", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe deshabilitar los botones de la rúbrica si la votación está cerrada", async () => {
    mockEvaluacionApi.obtenerEstado.mockResolvedValue({
      participante_actual_id: "123",
      palabra_actual_id: "456",
      votacion_abierta: false,
      participante: { nombre: "Ana", institucion: "UNAM" },
      palabra: { palabra: "necessary", ipa: "/IPA/" },
    });
    mockEvaluacionApi.obtenerMiVoto.mockResolvedValue(null);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PanelJuezPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const botones = screen.getAllByRole("button", { name: /^[0-3]$/ });
      expect(botones[0]).toBeDisabled();
    });
  });

  it("debe habilitar los botones si la votación está abierta", async () => {
    mockEvaluacionApi.obtenerEstado.mockResolvedValue({
      participante_actual_id: "123",
      palabra_actual_id: "456",
      votacion_abierta: true,
      participante: { nombre: "Ana", institucion: "UNAM" },
      palabra: { palabra: "necessary", ipa: "/IPA/" },
    });
    mockEvaluacionApi.obtenerMiVoto.mockResolvedValue(null);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PanelJuezPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const botones = screen.getAllByRole("button", { name: /^[0-3]$/ });
      expect(botones[0]).not.toBeDisabled();
    });
  });
});