import { prisma } from "@/lib/prisma";
import GroceryApp from "@/components/GroceryApp";

export default async function Home() {
  const [kategorier, varer] = await Promise.all([
    prisma.kategori.findMany({ orderBy: { rekkefolge: "asc" } }),
    prisma.vare.findMany({
      include: { kategori: true },
      orderBy: { navn: "asc" },
    }),
  ]);

  return <GroceryApp initialKategorier={kategorier} initialVarer={varer} />;
}
