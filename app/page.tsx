import Link from "next/link";

const pillars = [
  {
    title: "Frontend · Next.js",
    description:
      "App Router UI with dedicated authentication and dashboard screens wired to the API layer.",
  },
  {
    title: "Backend · Express",
    description:
      "Layered Node.js service (routes, controllers, services, repositories, middleware) under /server/src.",
  },
  {
    title: "Database · PostgreSQL",
    description:
      "Connection pool and SQL migration for a users table with UUID keys and enterprise-friendly schemas.",
  },
  {
    title: "Security · JWT",
    description:
      "Token issuing, verification middleware, and protected profile endpoint for authenticated workflows.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-8 py-12">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Enterprise Starter</p>
        <h1 className="text-4xl font-semibold text-white">Next.js + Express + PostgreSQL + JWT</h1>
        <p className="max-w-3xl text-zinc-300">
          This template uses a scalable, domain-oriented structure that separates application layers and keeps
          business logic isolated from transport concerns.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-lg font-medium text-white">{pillar.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{pillar.description}</p>
          </article>
        ))}
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/login" className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white">
          Open login flow
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200"
        >
          Open protected dashboard
        </Link>
      </section>
    </main>
  );
}
