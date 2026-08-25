import { sjekkAdminInnlogget, hentForesporsler, hentKoder, hentLagre } from "@/lib/access/admin-actions";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const innlogget = await sjekkAdminInnlogget();

  if (!innlogget) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin</h1>
          <p className="mt-2 text-sm text-foreground-muted">Logg inn for å administrere tilgang.</p>
        </div>
        <AdminLogin />
      </div>
    );
  }

  const [foresporsler, koder, lagre] = await Promise.all([
    hentForesporsler(),
    hentKoder(),
    hentLagre(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 pb-16">
      <AdminDashboard initialForesporsler={foresporsler} initialKoder={koder} initialLagre={lagre} />
    </div>
  );
}
