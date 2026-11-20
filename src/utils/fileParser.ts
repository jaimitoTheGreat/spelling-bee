import * as XLSX from "xlsx";
import mammoth from "mammoth";

export interface PalabraImportada {
  palabra: string;
  ipa: string;
  nivel_mcer: string;
  audio_url?: string | null;
}

export async function parseArchivo(file: File): Promise<PalabraImportada[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  // 1. Manejo de JSON
  if (extension === "json") {
    const text = await file.text();
    const json = JSON.parse(text);
    if (!Array.isArray(json)) throw new Error("El JSON debe ser un arreglo.");
    return json;
  }

  // 2. Manejo de Excel y CSV
  if (extension === "xlsx" || extension === "xls" || extension === "csv") {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet);
    
    return rows.map((row) => ({
      palabra: row.palabra || row.Palabra || row.PALABRA || row.word || "",
      ipa: row.ipa || row.IPA || row.fonetica || "",
      nivel_mcer: row.nivel_mcer || row.Nivel || row.nivel || "Fácil",
      audio_url: row.audio_url || row.audio || null,
    })).filter(p => p.palabra && p.ipa); 
  }

  // 3. Manejo de Word (.docx) leyendo tablas reales
  if (extension === "docx") {
    const arrayBuffer = await file.arrayBuffer();
    
    // Convertimos a HTML en lugar de texto plano
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const rows = Array.from(doc.querySelectorAll("tr")); // Buscamos filas de tabla
    
    const parsed: PalabraImportada[] = [];

    // Si encontró una tabla válida (más de 1 fila contando la cabecera)
    if (rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll("td"));
        if (cells.length >= 3) {
          parsed.push({
            palabra: cells[0].textContent?.trim() || "",
            ipa: cells[1].textContent?.trim() || "",
            nivel_mcer: cells[2].textContent?.trim() || "Fácil",
            audio_url: cells[3]?.textContent?.trim() || null,
          });
        }
      }
      return parsed.filter(p => p.palabra && p.ipa);
    }

    // Si no encontró tabla, es porque el Word era texto suelto
    throw new Error("El archivo Word debe contener una Tabla con las columnas: palabra, ipa, nivel_mcer.");
  }

  throw new Error("Formato no soportado. Usa .json, .csv, .xlsx o .docx");
}