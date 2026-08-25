import { createClient } from "@/lib/supabase/server";
import { mapKategori, mapVare, mapPlanlagtIngrediens } from "@/lib/mappers";
import { kreverAktivLager } from "@/lib/access/session";
import GroceryApp from "@/components/GroceryApp";

export default async function Home() {
  const lagerId = await kreverAktivLager();
  const supabase = await createClient();

  const [
    { data: kategorier, error: kategoriError },
    { data: varer, error: vareError },
    { data: middagsplan, error: middagsplanError },
  ] = await Promise.all([
    supabase.from("kategori").select("*").order("rekkefolge", { ascending: true }),
    supabase
      .from("vare")
      .select("*, kategori(*)")
      .eq("lager_id", lagerId)
      .order("navn", { ascending: true }),
    supabase
      .from("middag_ingrediens")
      .select("*")
      .eq("lager_id", lagerId)
      .order("opprettet", { ascending: true }),
  ]);

  if (kategoriError) throw kategoriError;
  if (vareError) throw vareError;
  if (middagsplanError) throw middagsplanError;

  return (
    <GroceryApp
      initialKategorier={(kategorier ?? []).map(mapKategori)}
      initialVarer={(varer ?? []).map(mapVare)}
      initialMiddagsplan={(middagsplan ?? []).map(mapPlanlagtIngrediens)}
    />
  );
}
