import Link from "next/link";
import { listClients } from "@/lib/clients";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

// Internal landing page (for the agency). Clients never see this — they receive
// a direct /c/<slug> link. Lists known clients for quick access.
export default async function Home() {
  const clients = await listClients();
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      {/* Hero */}
      <div className="flex flex-wrap items-center gap-4">
        <Logo size="lg" />
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] muted">
          <span className="pulse-dot" />
          Live
        </div>
      </div>

      <h1 className="mt-8 text-4xl font-bold tracking-tight md:text-5xl">
        Geriko <span style={{ color: "var(--accent-strong)" }}>Dashboard</span>
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed muted">
        Performance outbound in tempo reale: metriche, deliverability, contatti e
        persone interessate — aggiornate in automatico.
      </p>

      {/* Clients */}
      <div className="mt-12">
        <div className="grid gap-3 sm:grid-cols-2">
          {clients.map((c) => {
            const accent = c.accentColor ?? "#aad8d8";
            return (
              <Link
                key={c.slug}
                href={`/c/${c.slug}`}
                className="card lift group flex items-center gap-4 px-5 py-4"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold"
                  style={{ background: accent, color: "#022226" }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold" style={{ color: "var(--ink)" }}>
                    {c.name}
                  </div>
                  <div className="truncate text-xs muted">Apri la dashboard</div>
                </div>
                <span className="accent text-sm font-medium transition-transform group-hover:translate-x-0.5">
                  Apri →
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <footer className="mt-16 border-t border-[var(--border)] pt-5 text-xs muted">
        Axend
      </footer>
    </main>
  );
}
