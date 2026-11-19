export function AyudaPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="sb-display text-3xl sb-champagne">Ayuda y Soporte Técnico</h1>
        <p className="sb-mono sb-faint mt-1">Manual de usuario y resolución de problemas</p>
      </div>

      <div className="space-y-4">
        <details className="sb-panel p-4 cursor-pointer group">
          <summary className="font-semibold text-[var(--champagne)] list-none flex justify-between items-center">
            ¿Cómo iniciar una ronda de Muerte Súbita?
            <span className="text-[var(--gold)] group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Ve al Dashboard, en la esquina superior derecha haz clic en el botón "💀 Muerte Súbita". El sistema cambiará la ronda actual y te permitirá seleccionar a los participantes empatados.
          </p>
        </details>

        <details className="sb-panel p-4 cursor-pointer group">
          <summary className="font-semibold text-[var(--champagne)] list-none flex justify-between items-center">
            ¿Qué hago si un juez no puede votar (botones bloqueados)?
            <span className="text-[var(--gold)] group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Significa que el organizador aún no ha finalizado la participación oral. Pídele al organizador que presione "⏹ Finalizar Voto" en su Dashboard para desbloquear tu pantalla.
          </p>
        </details>

        <details className="sb-panel p-4 cursor-pointer group">
          <summary className="font-semibold text-[var(--champagne)] list-none flex justify-between items-center">
            El audio no se escucha en la proyección
            <span className="text-[var(--gold)] group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Haz clic en cualquier parte de la pantalla de proyección (esto le da permiso al navegador). Si usas Linux, asegúrate de tener instalado <code>speech-dispatcher</code>. Para máxima calidad, sube archivos MP3 a Supabase Storage y guarda la URL en el vocabulario.
          </p>
        </details>

        <details className="sb-panel p-4 cursor-pointer group">
          <summary className="font-semibold text-[var(--champagne)] list-none flex justify-between items-center">
            ¿Cómo importar un banco de palabras desde Excel?
            <span className="text-[var(--gold)] group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Ve a la sección "Vocabulario", haz clic en "Importar Archivo" y sube tu Excel (.xlsx) o CSV. Asegúrate de que las columnas se llamen <b>palabra</b>, <b>ipa</b> y <b>nivel_mcer</b>.
          </p>
        </details>
      </div>
    </div>
  );
}