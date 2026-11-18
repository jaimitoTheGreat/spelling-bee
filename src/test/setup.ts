import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, vi } from "vitest";
import { server } from "./msw/server";

afterEach(() => cleanup());

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ⬇️ AGREGA ESTO PARA SIMULAR EL AUDIO DEL NAVEGADOR ⬇️
Object.defineProperty(window, "speechSynthesis", {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
  },
  writable: true,
});

global.SpeechSynthesisUtterance = class {
  text: string;
  lang: string = "";
  rate: number = 1;
  constructor(text: string) { this.text = text; }
} as any;