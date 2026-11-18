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
      nivel_mcer: row.nivel_mcer || row.Nivel || row.nivel || "A1",
      audio_url: row.audio_url || row.audio || null,
    })).filter(p => p.palabra && p.ipa); // Filtramos los que no tengan palabra o IPA
  }

  // 3. Manejo de Word (.docx)
  if (extension === "docx") {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    // Asumimos que cada línea es: palabra, ipa, nivel, [audio_url] (separados por coma o tab)
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const parsed: PalabraImportada[] = [];

    for (const line of lines) {
      // Evitar procesar encabezados
      if (line.toLowerCase().includes("palabra") && line.toLowerCase().includes("nivel")) continue;
      
      const parts = line.split(/[,\t]/).map(p => p.trim());
      if (parts.length >= 3) {
        parsed.push({
          palabra: parts[0],
          ipa: parts[1],
          nivel_mcer: parts[2],
          audio_url: parts[3] || null,
        });
      }
    }
    return parsed;
  }

  throw new Error("Formato no soportado. Usa .json, .csv, .xlsx o .docx");
}