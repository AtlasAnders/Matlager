"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Enhet } from "@/generated/prisma/enums";

function rund(n: number) {
  return Math.round(n * 100) / 100;
}

export type VareInput = {
  navn: string;
  kategoriId: string;
  mengde: number;
  enhet: Enhet;
};

export async function opprettVare(input: VareInput) {
  const navn = input.navn.trim();
  if (!navn) throw new Error("Navn er påkrevd");

  const vare = await prisma.vare.create({
    data: {
      navn,
      kategoriId: input.kategoriId,
      mengde: Math.max(0, rund(input.mengde)),
      enhet: input.enhet,
    },
    include: { kategori: true },
  });
  revalidatePath("/");
  return vare;
}

export async function oppdaterVare(id: string, input: VareInput) {
  const navn = input.navn.trim();
  if (!navn) throw new Error("Navn er påkrevd");

  const vare = await prisma.vare.update({
    where: { id },
    data: {
      navn,
      kategoriId: input.kategoriId,
      mengde: Math.max(0, rund(input.mengde)),
      enhet: input.enhet,
    },
    include: { kategori: true },
  });
  revalidatePath("/");
  return vare;
}

export async function slettVare(id: string) {
  await prisma.vare.delete({ where: { id } });
  revalidatePath("/");
}

export async function endreMengde(id: string, delta: number) {
  const eksisterende = await prisma.vare.findUniqueOrThrow({ where: { id } });
  const nyMengde = Math.max(0, rund(eksisterende.mengde + delta));

  const vare = await prisma.vare.update({
    where: { id },
    data: { mengde: nyMengde },
    include: { kategori: true },
  });
  revalidatePath("/");
  return vare;
}

export async function settMengde(id: string, mengde: number) {
  const vare = await prisma.vare.update({
    where: { id },
    data: { mengde: Math.max(0, rund(mengde)) },
    include: { kategori: true },
  });
  revalidatePath("/");
  return vare;
}
