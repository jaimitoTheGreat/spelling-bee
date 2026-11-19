import { Outlet, NavLink, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-md transition-colors text-sm font-medium ${
      isActive
        ? "bg-[var(--gold)] text-[var(--ink)]"
        : "text-[var(--champagne)] hover:bg-[var(--graphite)]"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--lacquer)]">
      {/* Cabecera Institucional */}
      <header className="flex items-center justify-between border-b border-[var(--rule)] bg-[var(--raised)] px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 text-[var(--champagne)]"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            ☰
          </button>
          <svg width="24" height="24" viewBox="0 0 30 30">
            <rect width="30" height="30" rx="4" fill="var(--gold)" />
            <path d="M7 23 L23 7" stroke="var(--ink)" strokeWidth="2.5" />
          </svg>
          <h1 className="sb-wordmark text-sm text-[var(--champagne)] hidden sm:block">
            Spelling Bee 2026
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--muted)] hidden sm:block">
            {user?.nombre} ({user?.rol})
          </span>
          <button onClick={handleLogout} className="sb-btn sb-btn-secondary sb-btn-sm">
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Menú Lateral */}
        <aside
          className={`
            absolute md:static top-0 left-0 h-full w-64 bg-[var(--deep)] border-r border-[var(--rule)] p-4 z-10
            transition-transform duration-300 flex flex-col
            ${menuAbierto ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          {/* flex-1 hace que esta sección ocupe todo el espacio disponible */}
          <nav className="space-y-2 flex-1">
            <p className="sb-mono text-[var(--faint)] px-4 mb-4">Navegación</p>
            
            {user?.rol === "organizador" && (
              <>
                <NavLink to="/dashboard" className={linkClass} onClick={() => setMenuAbierto(false)}>
                  Dashboard
                </NavLink>
                <NavLink to="/jueces" className={linkClass} onClick={() => setMenuAbierto(false)}>
                  Gestión de Jueces
                </NavLink>
                <NavLink to="/participantes" className={linkClass} onClick={() => setMenuAbierto(false)}>
                  Participantes
                </NavLink>
                <NavLink to="/vocabulario" className={linkClass} onClick={() => setMenuAbierto(false)}>
                  Vocabulario
                </NavLink>
              </>
            )}

            {user?.rol === "juez" && (
              <NavLink to="/juez" className={linkClass} onClick={() => setMenuAbierto(false)}>
                Panel de Evaluación
              </NavLink>
            )}
          </nav>

          {/* mt-auto empuja este bloque hasta el fondo del menú */}
          <div className="mt-auto pt-4 border-t border-[var(--rule)]">
            <NavLink to="/ayuda" className={linkClass} onClick={() => setMenuAbierto(false)}>
              ❓ Ayuda y Soporte
            </NavLink>
          </div>
        </aside>

        {/* Capa oscura para móvil cuando el menú está abierto */}
        {menuAbierto && (
          <div
            className="fixed inset-0 bg-black/50 z-0 md:hidden"
            onClick={() => setMenuAbierto(false)}
          />
        )}

        {/* Contenido Principal */}
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}