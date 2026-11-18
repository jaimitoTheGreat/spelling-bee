import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router";
import { loginSchema, type LoginForm } from "../../schemas/auth";
import { useAuth } from "../../auth/AuthContext";
import { useState } from "react";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setErrorMsg("");
    const error = await login(data.email, data.password);
    if (error) {
      setErrorMsg(error);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--lacquer)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="sb-display text-4xl text-[var(--champagne)]">
            Spelling Bee <span className="text-[var(--gold)]">Nova</span>
          </h1>
          <p className="sb-mono text-[var(--faint)] mt-2">Acceso Organizador</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="sb-panel space-y-4 p-6">
          <div>
            <input
              {...register("email")}
              className="sb-input"
              placeholder="Correo institucional"
            />
            {errors.email && <p className="text-xs text-[var(--vermilion)] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <input
              type="password"
              {...register("password")}
              className="sb-input"
              placeholder="Contraseña"
            />
            {errors.password && <p className="text-xs text-[var(--vermilion)] mt-1">{errors.password.message}</p>}
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded text-sm text-[var(--vermilion)] text-center">
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="sb-btn sb-btn-primary w-full">
            {isSubmitting ? "Entrando..." : "Iniciar sesión"}
          </button>

          <div className="text-center mt-4">
            <Link to="/acceso-juez" className="sb-link">
              ¿Eres juez? Accede con tu código →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}