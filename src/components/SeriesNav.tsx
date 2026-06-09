const SERIES_URL =
  "https://github.com/stars/catherinepereira/lists/explorables";

type SeriesItem = {
  slug: string;
  title: string;
  href: string;
};

const SERIES: SeriesItem[] = [
  {
    slug: "bpe-playground",
    title: "BPE Playground",
    href: "https://bpe-playground.vercel.app/",
  },
  {
    slug: "cnn-playground",
    title: "CNN Playground",
    href: "https://cnn-playground.vercel.app/",
  },
  {
    slug: "cnn-visualizer",
    title: "CNN Visualizer",
    href: "https://cnn-visualizer-cat.vercel.app/",
  },
  {
    slug: "cnn-architecture-comparison",
    title: "CNN Architectures",
    href: "https://cnn-architecture-comparison.vercel.app/",
  },
  {
    slug: "cv-interpretability",
    title: "CV Interpretability",
    href: "https://cv-interpretability.vercel.app/",
  },
  {
    slug: "embeddings-playground",
    title: "Embeddings Playground",
    href: "https://embeddings-playground-cat.vercel.app/",
  },
];

type Props = {
  currentSlug: string;
};

export function SeriesNav({ currentSlug }: Props) {
  return (
    <nav className="mb-5 flex flex-wrap items-baseline gap-2 text-xs text-gray-500 dark:text-zinc-500">
      <a
        href={SERIES_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="tracking-wider text-gray-500 uppercase hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400"
      >
        Explorables Series
      </a>
      <span className="text-gray-300 dark:text-zinc-700">/</span>
      {SERIES.map((item, i) => (
        <span key={item.slug} className="flex items-baseline gap-2">
          {item.slug === currentSlug ? (
            <span className="font-medium text-gray-900 dark:text-zinc-100">
              {item.title}
            </span>
          ) : (
            <a
              href={item.href}
              className="text-gray-500 underline-offset-2 hover:text-blue-600 hover:underline dark:text-zinc-400 dark:hover:text-blue-400"
            >
              {item.title}
            </a>
          )}
          {i < SERIES.length - 1 && (
            <span className="text-gray-300 dark:text-zinc-700">·</span>
          )}
        </span>
      ))}
    </nav>
  );
}
