import { RouterProvider } from "react-router";
import { router } from "./routes/router";
import { useRealtime } from "./hooks/useRealtime";

export default function App() {
  // Inicializa la conexión WebSocket para toda la aplicación
  useRealtime();

  return <RouterProvider router={router} />;
}