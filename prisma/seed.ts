import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const kategorier = [
  { navn: "Pasta", farge: "#C97B63", ikon: "Wheat" },
  { navn: "Tørrvarer", farge: "#D4B996", ikon: "Package" },
  { navn: "Hermetikk", farge: "#8FA398", ikon: "Soup" },
  { navn: "Meieri", farge: "#E8D9A0", ikon: "Milk" },
  { navn: "Frukt & grønt", farge: "#7C9473", ikon: "Apple" },
  { navn: "Kjøtt & fisk", farge: "#C48B8B", ikon: "Beef" },
  { navn: "Frost", farge: "#9DB4C0", ikon: "Snowflake" },
  { navn: "Drikke", farge: "#6E9B96", ikon: "CupSoda" },
  { navn: "Snacks", farge: "#C4A572", ikon: "Popcorn" },
  { navn: "Krydder & baking", farge: "#B08968", ikon: "ChefHat" },
  { navn: "Husholdning", farge: "#A8A296", ikon: "SprayCan" },
  { navn: "Annet", farge: "#B5AFA6", ikon: "Boxes" },
];

async function main() {
  for (let i = 0; i < kategorier.length; i++) {
    const k = kategorier[i];
    await prisma.kategori.upsert({
      where: { navn: k.navn },
      update: { farge: k.farge, ikon: k.ikon, rekkefolge: i },
      create: { ...k, rekkefolge: i },
    });
  }

  const meieri = await prisma.kategori.findUniqueOrThrow({ where: { navn: "Meieri" } });
  const fruktGront = await prisma.kategori.findUniqueOrThrow({ where: { navn: "Frukt & grønt" } });
  const pasta = await prisma.kategori.findUniqueOrThrow({ where: { navn: "Pasta" } });
  const drikke = await prisma.kategori.findUniqueOrThrow({ where: { navn: "Drikke" } });

  const eksisterendeVarer = await prisma.vare.count();
  if (eksisterendeVarer === 0) {
    await prisma.vare.createMany({
      data: [
        { navn: "Melk", kategoriId: meieri.id, mengde: 2, enhet: "l" },
        { navn: "Egg", kategoriId: meieri.id, mengde: 0, enhet: "pakke" },
        { navn: "Bananer", kategoriId: fruktGront.id, mengde: 6, enhet: "stk" },
        { navn: "Spaghetti", kategoriId: pasta.id, mengde: 1, enhet: "pakke" },
        { navn: "Farris", kategoriId: drikke.id, mengde: 4, enhet: "stk" },
      ],
    });
  }

  console.log("Seeding fullført.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
