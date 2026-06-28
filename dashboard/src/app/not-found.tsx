import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <span className="brand-mark mb-5" style={{ width: 44, height: 44, fontSize: 18 }}>
        A
      </span>
      <div className="text-xs uppercase tracking-widest muted">404</div>
      <h1 className="mt-2 text-2xl font-bold">Dashboard non trovata</h1>
      <p className="mt-2 text-sm muted">
        Questo link non è valido o il cliente non esiste più. Controlla l&apos;URL
        che ti è stato fornito.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg accent-bg px-4 py-2 text-sm font-medium"
      >
        Torna alla home
      </Link>
    </main>
  );
}
