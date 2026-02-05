import { supabase } from "../../services/supabase.js";

/**
 * Haalt alle medewerkers op uit Supabase
 * Verwacht tabel: medewerkers
 * Velden: id, naam
 */
export async function haalMedewerkersOp() {
  const { data, error } = await supabase
    .from("medewerkers")
    .select("id, naam")
    .order("naam", { ascending: true });

  if (error) {
    console.error("❌ Fout bij laden medewerkers:", error);
    return [];
  }

  console.log("✅ Medewerkers geladen:", data);
  return data;
}