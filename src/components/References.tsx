// End-of-page references block. Pass a list of {authors, year, title, href}.
// Use inline links at the point of mention inside sections. This block is the
// catch-all at the bottom of the page.

export type Reference = {
  authors: string;
  year: number | string;
  title: string;
  href: string;
};

type Props = {
  items: Reference[];
};

export function References({ items }: Props) {
  return (
    <section
      id="references"
      aria-label="References"
      className="mt-2 scroll-mt-20"
    >
      <div className="mb-3 text-xs tracking-wider text-gray-500 uppercase dark:text-zinc-500">
        References
      </div>
      <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-xs text-gray-600 marker:text-gray-400 dark:text-zinc-400 marker:dark:text-zinc-500">
        {items.map((r) => (
          <li key={r.href} className="leading-relaxed">
            <a
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 underline-offset-2 hover:text-blue-600 hover:underline dark:text-zinc-300 dark:hover:text-blue-400"
            >
              {r.title}. {r.authors} ({r.year})
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
