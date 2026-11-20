import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AyudaPage } from "../routes/pages/AyudaPage";

describe("Ayuda y Soporte Técnico - PT-28", () => {
  it("debe renderizar el manual de usuario correctamente", () => {
    render(<AyudaPage />);

    // Verificamos el título principal
    expect(screen.getByText("Ayuda y Soporte Técnico")).toBeInTheDocument();
    
    // Verificamos que existan las preguntas frecuentes (acordeones)
    expect(screen.getByText(/¿Cómo iniciar una ronda de Muerte Súbita?/i)).toBeInTheDocument();
    expect(screen.getByText(/El audio no se escucha en la proyección/i)).toBeInTheDocument();
  });
});