import { createClient } from "@/lib/supabase/server";
import { mapKategori, mapVare } from "@/lib/mappers";
import GroceryApp from "@/components/GroceryApp";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: kategorier, error: kategoriError }, { data: varer, error: vareError }] =
    await Promise.all([
      supabase.from("kategori").select("*").order("rekkefolge", { ascending: true }),
      supabase
        .from("vare")
        .select("*, kategori(*)")
        .order("navn", { ascending: true }),
    ]);

  if (kategoriError) throw kategoriError;
  if (vareError) throw vareError;

  return (
    <GroceryApp
      initialKategorier={(kategorier ?? []).map(mapKategori)}
      initialVarer={(varer ?? []).map(mapVare)}
    />
  );
}
