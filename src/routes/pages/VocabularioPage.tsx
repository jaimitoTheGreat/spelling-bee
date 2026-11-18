import { useState, useDeferredValue } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { vocabularioApi } from "../../api/vocabulario";
import { reproducirPalabra } from "../../utils/audio"; // <-- IMPORT CORREGIDO
import { parseArchivo } from "../../utils/fileParser";
import type { NivelMCER, Palabra } from "../../types";

const LIMIT = 10;

export function VocabularioPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filtroNivel, setFiltroNivel] = useState<NivelMCER | "">("");
  const [palabraSeleccionada, setPalabraSeleccionada] = useState<Palabra | null>(null);
  
  const [modalImportar, setModalImportar] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const { data: metricas } = useQuery({
    queryKey: ["vocabulario-metricas"],
    queryFn: vocabularioApi.obtenerMetricas,
  });

  const { data: lista } = useQuery({
    queryKey: ["vocabulario", deferredSearch, filtroNivel, page],
    queryFn: () => vocabularioApi.listar({ search: deferredSearch, nivel: filtroNivel, page, limit: LIMIT }),
  });

  const { register, handleSubmit, reset } = useForm<Omit<Palabra, "id"|"created_at"|"usado">>();
  
  const crearMutation = useMutation({
    mutationFn: vocabularioApi.crear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulario"] });
      queryClient.invalidateQueries({ queryKey: ["vocabulario-metricas"] });
      reset();
      alert("Palabra agregada");
    },
  });

  const importarMutation = useMutation({
    mutationFn: vocabularioApi.importar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulario"] });
      queryClient.invalidateQueries({ queryKey: ["vocabulario-metricas"] });
      setModalImportar(false);
      setArchivo(null);
      alert("Vocabulario importado correctamente");
    },
    onError: (e) => alert("Error al guardar en la BD: " + e.message)
  });

  const handleImportar = async () => {
    if (!archivo) return;
    try {
      setImportando(true);
      const palabras = await parseArchivo(archivo);
      if (palabras.length === 0) throw new Error("El archivo está vacío o no tiene el formato correcto.");
      importarMutation.mutate(palabras as any);
    } catch (e: any) {
      alert(e.message || "Error al leer el archivo");
    } finally {
      setImportando(false);
    }
  };

  // Usamos la nueva función unificada
  const handleReproducir = (p: Palabra) => {
    reproducirPalabra(p.palabra, p.audio_url);
  };

  const totalPages = lista?.total ? Math.ceil(lista.total / LIMIT) : 1;
  const NIVELES: NivelMCER[] = ["A1", "A2", "B1", "B2", "C1", "C2", "Muerte Súbita"];

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="sb-display text-3xl sb-champagne">Banco de Vocabulario</h1>
          <p className="sb-mono sb-faint mt-1">Gestión de palabras y fonética</p>
        </div>
        <button onClick={() => setModalImportar(true)} className="sb-btn sb-btn-secondary">Importar Archivo</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="sb-panel p-4"><p className="sb-mono sb-faint">Total Palabras</p><p className="text-3xl font-bold text-[var(--champagne)]">{metricas?.total ?? "-"}</p></div>
        <div className="sb-panel p-4"><p className="sb-mono sb-faint">Utilizadas</p><p className="text-3xl font-bold text-[var(--patina)]">{metricas?.usadas ?? "-"}</p></div>
        <div className="sb-panel p-4"><p className="sb-mono sb-faint">Sin Utilizar</p><p className="text-3xl font-bold text-[var(--gold)]">{metricas?.sinUsar ?? "-"}</p></div>
      </div>

      <div className="sb-panel p-6">
        <h2 className="text-lg font-semibold sb-champagne mb-4">Agregar Palabra Manual</h2>
        <form onSubmit={handleSubmit(d => crearMutation.mutate(d))} className="flex flex-col md:flex-row gap-3 items-start w-full">
          <input {...register("palabra", { required: true })} className="sb-input flex-1 min-w-[120px]" placeholder="Palabra en inglés" />
          <input {...register("ipa", { required: true })} className="sb-input flex-1 min-w-[120px]" placeholder="Fonética IPA" />
          <input {...register("audio_url")} className="sb-input flex-1 min-w-[150px]" placeholder="URL audio (opcional)" />
          <select {...register("nivel_mcer", { required: true })} className="sb-input w-full md:w-40">
            {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button type="submit" className="sb-btn sb-btn-primary w-full md:w-auto whitespace-nowrap">Agregar</button>
        </form>
      </div>

      <div className="sb-panel">
        <div className="p-4 border-b border-[var(--rule)] flex flex-col md:flex-row gap-3">
          <input type="text" placeholder="Buscar palabra..." className="sb-input flex-1 min-w-[200px]" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className="sb-input w-full md:w-48" value={filtroNivel} onChange={(e) => { setFiltroNivel(e.target.value as NivelMCER); setPage(1); }}>
            <option value="">Todos los niveles</option>
            {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--deep)] border-b border-[var(--rule)]">
              <tr>
                <th className="p-4 sb-mono text-[var(--faint)] font-normal">Palabra</th>
                <th className="p-4 sb-mono text-[var(--faint)] font-normal">IPA</th>
                <th className="p-4 sb-mono text-[var(--faint)] font-normal">Nivel</th>
                <th className="p-4 sb-mono text-[var(--faint)] font-normal">Estado</th>
                <th className="p-4 sb-mono text-[var(--faint)] font-normal text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista?.data.map((p) => (
                <tr key={p.id} className="border-b border-[var(--rule)] hover:bg-[var(--deep)]/50 cursor-pointer" onClick={() => setPalabraSeleccionada(p)}>
                  <td className="p-4 font-semibold sb-champagne">{p.palabra}</td>
                  <td className="p-4 font-mono text-[var(--muted)]">{p.ipa}</td>
                  <td className="p-4">{p.nivel_mcer}</td>
                  <td className="p-4">
                    <span className={`sb-chip ${p.usado ? 'sb-chip-patina' : ''}`}>{p.usado ? 'Utilizada' : 'Sin usar'}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); handleReproducir(p); }} className="sb-link">🔊 Escuchar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-[var(--rule)] flex justify-between items-center">
           <span className="text-sm text-[var(--muted)]">Página {page} de {totalPages}</span>
           <div className="flex gap-2">
             <button className="sb-btn sb-btn-secondary sb-btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
             <button className="sb-btn sb-btn-secondary sb-btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
           </div>
        </div>
      </div>

      {palabraSeleccionada && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setPalabraSeleccionada(null)}>
          <div className="w-full max-w-md bg-[var(--lacquer)] h-full p-6 shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="sb-mono sb-faint">Detalle de Palabra</h2>
              <button onClick={() => setPalabraSeleccionada(null)} className="sb-link">Cerrar ✕</button>
            </div>
            <h1 className="sb-display text-5xl sb-gold mb-2">{palabraSeleccionada.palabra}</h1>
            <p className="text-2xl font-mono text-[var(--champagne)]">{palabraSeleccionada.ipa}</p>
            <div className="mt-8 space-y-4">
              <div className="sb-inset p-4"><p className="sb-mono sb-faint mb-2">Nivel MCER</p><span className="sb-chip sb-chip-gold">{palabraSeleccionada.nivel_mcer}</span></div>
              <div className="sb-inset p-4 flex items-center justify-between">
                <div><p className="sb-mono sb-faint mb-1">Audio de Pronunciación</p><p className="text-xs text-[var(--muted)]">{palabraSeleccionada.audio_url ? 'Archivo externo' : 'Generado por TTS'}</p></div>
                <button onClick={() => handleReproducir(palabraSeleccionada)} className="sb-btn sb-btn-primary sb-btn-sm">▶ Reproducir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalImportar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--raised)] p-6 rounded-lg w-full max-w-lg border border-[var(--rule)]">
            <h2 className="text-xl font-semibold sb-champagne mb-2">Importar Vocabulario</h2>
            <p className="text-sm text-[var(--muted)] mb-6">
              Sube un archivo CSV, Excel, Word o JSON. Columnas requeridas: <br/>
              <code className="text-xs text-[var(--gold)]">palabra</code>, <code className="text-xs text-[var(--gold)]">ipa</code>, <code className="text-xs text-[var(--gold)]">nivel_mcer</code>.
            </p>
            
            <input 
              type="file" 
              accept=".json,.csv,.xlsx,.xls,.docx"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="sb-input mb-6 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[var(--gold)] file:text-[var(--ink)] hover:file:bg-[var(--gold-rich)] cursor-pointer"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => { setModalImportar(false); setArchivo(null); }} className="sb-btn sb-btn-secondary">Cancelar</button>
              <button 
                onClick={handleImportar} 
                disabled={!archivo || importando || importarMutation.isPending} 
                className="sb-btn sb-btn-primary"
              >
                {importando || importarMutation.isPending ? "Procesando..." : "Importar Datos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}