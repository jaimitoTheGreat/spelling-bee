import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { Usuario } from "../types";

interface AuthContextValue {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  accesoJuez: (codigo: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión de organizador al recargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email, nombre: session.user.user_metadata?.nombre ?? "Organizador", rol: "organizador" });
      }
      setLoading(false);
    });

    // Escuchar cambios de sesión (login/logout de organizador)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email, nombre: session.user.user_metadata?.nombre ?? "Organizador", rol: "organizador" });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  const accesoJuez = async (codigo: string): Promise<string | null> => {
    const { data, error } = await supabase.rpc("acceso_juez", { codigo_input: codigo });
    if (error) return error.message;
    if (data?.error) return data.error;
    // La sesión del juez vive en memoria (no es una sesión de Supabase Auth)
    setUser({ id: data.id, nombre: data.nombre, rol: "juez" });
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, accesoJuez, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};