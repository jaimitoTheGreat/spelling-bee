import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { AppLayout } from "./AppLayout";
// Las páginas se crearán en Fase 3. Por ahora deja placeholders.
import { LoginPage } from "./pages/LoginPage";
import { AccesoJuezPage } from "./pages/AccesoJuezPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JuecesPage } from "./pages/JuecesPage";
import { PanelJuezPage } from "./pages/PanelJuezPage";
import { ParticipantesPage } from "./pages/ParticipantesPage";
import { VocabularioPage } from "./pages/VocabularioPage";
import { ProyeccionPage } from "./pages/ProyeccionPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/acceso-juez", element: <AccesoJuezPage /> },
  { path: "/proyeccion", element: <ProyeccionPage />},
  {
    element: <ProtectedRoute roles={["organizador"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/jueces", element: <JuecesPage /> },
          { path: "/participantes", element: <ParticipantesPage />},
          { path: "/vocabulario", element: <VocabularioPage/> },
          
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={["juez"]} />,
    children: [{ path: "/juez", element: <PanelJuezPage /> }],
  },
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <Navigate to="/login" replace /> },
]);