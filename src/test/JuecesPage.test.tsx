import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import { JuecesPage } from "../routes/pages/JuecesPage";

// ✅ Hoisteamos el mock de la API de jueces
const { mockJuecesApi } = vi.hoisted(() => {
  return {
    mockJuecesApi: {
      listar: vi.fn(),
      crear: vi.fn(),
      desactivar: vi.fn(),
    },
  };
});

vi.mock("../api/jueces", () => ({ juecesApi: mockJuecesApi }));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe("Gestión de Jueces - Límite", () => {
  it("debe deshabilitar la creación si hay 5 jueces activos", async () => {
    mockJuecesApi.listar.mockResolvedValue([
      { id: "1", nombre: "J1", estado: "activo", codigo: "A" },
      { id: "2", nombre: "J2", estado: "activo", codigo: "B" },
      { id: "3", nombre: "J3", estado: "activo", codigo: "C" },
      { id: "4", nombre: "J4", estado: "activo", codigo: "D" },
      { id: "5", nombre: "J5", estado: "activo", codigo: "E" },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <JuecesPage />
      </QueryClientProvider>
    );

    const btnCrear = await screen.findByRole("button", { name: /Crear Juez/i });
    expect(btnCrear).toBeDisabled();
    expect(
      screen.getByText(/límite máximo de 5 jueces activos/i)
    ).toBeInTheDocument();
  });
});