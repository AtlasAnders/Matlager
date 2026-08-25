import TilgangSkjema from "./TilgangSkjema";

export default function TilgangPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dagligvarer</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Denne siden er kun for godkjente brukere.
        </p>
      </div>
      <TilgangSkjema />
    </div>
  );
}
