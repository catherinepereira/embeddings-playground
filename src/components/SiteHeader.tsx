import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { CreditLine } from "./CreditLine";

type Props = {
  title: string;
  repo: string;
  modelRepo?: string;
  children?: ReactNode;
};

export function SiteHeader({ title, repo, modelRepo, children }: Props) {
  return (
    <>
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {title}
        </h1>
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-zinc-500">
          <ThemeToggle />
          <CreditLine repo={repo} modelRepo={modelRepo} />
        </div>
      </header>
      {children && (
        <p className="mb-5 text-sm text-gray-600 dark:text-zinc-400">
          {children}
        </p>
      )}
    </>
  );
}
