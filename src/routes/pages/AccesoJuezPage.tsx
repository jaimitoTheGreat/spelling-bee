import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router";
import { accesoJuezSchema, type AccesoJuezForm } from "../../schemas/auth";
import { useAuth } from "../../auth/AuthContext";
import { useState } from "react";

export function AccesoJuezPage() {
  const { accesoJuez } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AccesoJuezForm>({
    resolver: zodResolver(accesoJuezSchema),
  });

  const onSubmit = async (data: AccesoJuezForm) => {
    setErrorMsg("");
    const error = await accesoJuez(data.codigo);
    if (error) {
      setErrorMsg(error);
    } else {
      navigate("/juez"); // Redirige al panel del juez
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--lacquer)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="sb-display text-4xl text-[var(--champagne)]">Acceso Juez</h1>
          <p className="sb-mono text-[var(--faint)] mt-2">Ingresa tu código único</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="sb-panel space-y-4 p-6">
          <div>
            <input
              {...register("codigo")}
              className="sb-input-code uppercase"
              placeholder="SB-XXXX"
              maxLength={7}
              autoComplete="off"
            />
            {errors.codigo && <p className="text-xs text-[var(--vermilion)] mt-1 text-center">{errors.codigo.message}</p>}
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded text-sm text-[var(--vermilion)] text-center">
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="sb-btn sb-btn-primary w-full">
            {isSubmitting ? "Validando..." : "Entrar"}
          </button>

          <div className="text-center mt-4">
            <Link to="/login" className="sb-link">
              ← Volver al acceso del organizador
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}