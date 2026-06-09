// Section + four standard content primitives:
//   - <Section id number title blurb> wraps one numbered section
//   - <Card>, <Label>, <Prose>, <Term> are the panel pieces

import type { ReactNode } from "react";

type Props = {
  id: string;
  number: string;
  title: string;
  blurb?: string;
  children: ReactNode;
};

export function Section({ id, number, title, blurb, children }: Props) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-2 flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-xs text-gray-400 dark:text-zinc-500">
          {number}
        </span>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
          {title}
        </h2>
      </div>
      {blurb && (
        <p className="mb-4 max-w-7xl text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
          {blurb}
        </p>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-gray-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 ${className}`}
    >
      {children}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-xs tracking-wider text-gray-500 uppercase dark:text-zinc-500">
      {children}
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-7xl space-y-3 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
      {children}
    </div>
  );
}

export function Term({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[0.85em] text-blue-600 dark:text-blue-400">
      {children}
    </span>
  );
}
