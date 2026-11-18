import { Navigate, Outlet } from "react-router";
import { useAuth } from "./AuthContext";
import type { Rol } from "../types";

export function ProtectedRoute({ roles }: { roles?: Rol[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando…</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  // Si la ruta exige un rol y el usuario no lo tiene, se bloquea (403)
  if (roles && !roles.includes(user.rol)) {
    return <div className="p-8 text-center">No tienes permiso para ver esta página.</div>;
  }

  return <Outlet />;
}