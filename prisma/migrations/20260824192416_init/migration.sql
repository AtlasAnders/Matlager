-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "navn" TEXT NOT NULL,
    "ikon" TEXT NOT NULL,
    "farge" TEXT NOT NULL,
    "rekkefolge" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Vare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "navn" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "mengde" REAL NOT NULL,
    "enhet" TEXT NOT NULL,
    "sistOppdatert" DATETIME NOT NULL,
    CONSTRAINT "Vare_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_navn_key" ON "Kategori"("navn");

-- CreateIndex
CREATE INDEX "Vare_kategoriId_idx" ON "Vare"("kategoriId");
