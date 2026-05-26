import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function LaunchPage({
  eyebrow,
  title,
  intro,
  children
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-electric"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Home
          </Link>
          <p className="mt-6 text-sm font-black uppercase text-shopred">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {intro}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="surface p-6 sm:p-8">{children}</div>
      </section>
    </div>
  );
}

export function PolicySection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 py-6 last:border-b-0 first:pt-0 last:pb-0">
      <h2 className="text-2xl font-black text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
        {children}
      </div>
    </section>
  );
}

export function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-shopred" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
