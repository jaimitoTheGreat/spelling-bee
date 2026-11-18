import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { juecesApi } from "../../api/jueces";
import { crearJuezSchema, type CrearJuezForm } from "../../schemas/juez";
import { useState } from "react";

export function JuecesPage() {
  const queryClient = useQueryClient();
  const [codigoNuevo, setCodigoNuevo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Consultar jueces
  const { data: jueces, isLoading } = useQuery({
    queryKey: ["jueces"],
    queryFn: juecesApi.listar,
  });

  const activos = jueces?.filter((j) => j.estado === "activo").length ?? 0;
  const limiteAlcanzado = activos >= 5;

  // 2. Formulario para crear
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CrearJuezForm>({
    resolver: zodResolver(crearJuezSchema),
  });

  const crearMutation = useMutation({
    mutationFn: (nombre: string) => juecesApi.crear(nombre),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jueces"] }); // Refresca la tabla
      setCodigoNuevo(data.codigo); // Muestra el código generado
      reset(); // Limpia el formulario
      setErrorMsg("");
    },
    onError: (error) => {
      setErrorMsg(error.message);
    },
  });

  const onSubmit = (data: CrearJuezForm) => {
    crearMutation.mutate(data.nombre);
  };

  if (isLoading) return <div className="p-6 sb-mono">Cargando jueces...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="sb-display text-3xl sb-champagne">Gestión de Jueces</h1>
          <p className="sb-mono sb-faint mt-1">Jueces activos: {activos} / 5</p>
        </div>
      </div>

      {/* Formulario de creación */}
      <div className="sb-panel p-6">
        <h2 className="text-lg font-semibold sb-champagne mb-4">Añadir nuevo juez</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 items-start">
          <div className="flex-1">
            <input
              {...register("nombre")}
              className="sb-input"
              placeholder="Nombre completo del juez"
              disabled={limiteAlcanzado}
            />
            {errors.nombre && <p className="text-xs text-[var(--vermilion)] mt-1">{errors.nombre.message}</p>}
          </div>
          <button 
            type="submit" 
            className="sb-btn sb-btn-primary" 
            disabled={limiteAlcanzado || crearMutation.isPending}
          >
            {crearMutation.isPending ? "Creando..." : "Crear Juez"}
          </button>
        </form>
        
        {limiteAlcanzado && (
          <p className="text-sm text-[var(--vermilion)] mt-2">
            Se ha alcanzado el límite máximo de 5 jueces activos.
          </p>
        )}
        {errorMsg && <p className="text-sm text-[var(--vermilion)] mt-2">{errorMsg}</p>}
      </div>

      {/* Alerta con el código recién creado */}
      {codigoNuevo && (
        <div className="sb-panel p-4 border-[var(--gold)] bg-[var(--deep)]">
          <p className="text-sm sb-champagne mb-1">¡Juez creado exitosamente!</p>
          <p className="text-sm text-[var(--muted)]">Comparte este código con el juez (solo se mostrará esta vez):</p>
          <div className="flex items-center gap-3 mt-2">
            <code className="text-2xl font-bold sb-gold">{codigoNuevo}</code>
            <button 
              onClick={() => { navigator.clipboard.writeText(codigoNuevo); alert("Copiado"); }}
              className="sb-btn sb-btn-secondary sb-btn-sm"
            >
              Copiar
            </button>
            <button onClick={() => setCodigoNuevo(null)} className="sb-link ml-auto">Cerrar</button>
          </div>
        </div>
      )}

      {/* Tabla de jueces */}
      <div className="sb-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--rule)]">
            <tr>
              <th className="p-4 sb-mono text-[var(--faint)] font-normal">Nombre</th>
              <th className="p-4 sb-mono text-[var(--faint)] font-normal">Código</th>
              <th className="p-4 sb-mono text-[var(--faint)] font-normal">Estado</th>
              <th className="p-4 sb-mono text-[var(--faint)] font-normal text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {jueces?.map((juez) => (
              <tr key={juez.id} className="border-b border-[var(--rule)] last:border-0">
                <td className="p-4 font-semibold sb-champagne">{juez.nombre}</td>
                <td className="p-4 font-mono">{juez.codigo}</td>
                <td className="p-4">
                  <span className={`sb-chip ${juez.estado === 'activo' ? 'sb-chip-patina' : ''}`}>
                    {juez.estado}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {juez.estado === "activo" && (
                    <button 
                      onClick={() => {
                        if(confirm("¿Desactivar a este juez? No podrá volver a entrar.")) {
                          juecesApi.desactivar(juez.id).then(() => queryClient.invalidateQueries({ queryKey: ["jueces"] }));
                        }
                      }}
                      className="sb-link text-[var(--vermilion)]"
                    >
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {jueces?.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[var(--muted)]">No hay jueces registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}