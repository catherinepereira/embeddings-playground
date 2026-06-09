import { SiteHeader } from "@/components/SiteHeader";
import { SeriesNav } from "@/components/SeriesNav";
import { References } from "@/components/References";
import { WhatIsAnEmbedding } from "@/sections/WhatIsAnEmbedding";
import { HowVectorsAreMade } from "@/sections/HowVectorsAreMade";
import { SeeingHighDimensions } from "@/sections/SeeingHighDimensions";
import { ExploreSection } from "@/sections/ExploreSection";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8 pb-28">
        <SiteHeader
          title="📍 Embeddings Playground"
          repo="embeddings-playground"
          modelRepo="embeddings-data-preprocessing"
        >
          <p>
            An{" "}
            <a
              href="https://en.wikipedia.org/wiki/Word_embedding"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-blue-600 dark:hover:text-blue-400"
            >
              embedding
            </a>{" "}
            converts items (such as an image, user data, an audio clip) into a
            point in space such that similar items sit close together. This page
            lets you explore and play 25,000 tracks placed by their embeddings,
            then explains the idea using a few audio clips.
          </p>
          <br />
          <p>
            Audio and metadata in this demo are from the Free Music Archive
            (FMA), and embeddings were built with the{" "}
            <a
              href="https://huggingface.co/laion/larger_clap_music_and_speech"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-blue-600 dark:hover:text-blue-400"
            >
              laion/larger_clap_music_and_speech
            </a>{" "}
            CLAP model and projected with{" "}
            <a
              href="https://umap-learn.readthedocs.io/en/latest/"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-blue-600 dark:hover:text-blue-400"
            >
              UMAP
            </a>
            .
          </p>
          <br />
          <p>
            This site shows how audio can be turned into an embedding. The same
            idea applies to other kinds of data: text embeddings place sentences
            with similar meaning near each other, and{" "}
            <a
              href="https://cnn-visualizer-cat.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-blue-600 dark:hover:text-blue-400"
            >
              image embeddings
            </a>{" "}
            do the same for pictures.
          </p>
        </SiteHeader>

        <SeriesNav currentSlug="embeddings-playground" />

        <main className="mt-12 flex flex-col gap-12">
          <ExploreSection />
          <WhatIsAnEmbedding />
          <HowVectorsAreMade />
          <SeeingHighDimensions />
          <References
            items={[
              {
                title: "Word embedding",
                authors: "Wikipedia",
                year: "n.d.",
                href: "https://en.wikipedia.org/wiki/Word_embedding",
              },
              {
                title:
                  "Large-scale Contrastive Language-Audio Pretraining (CLAP)",
                authors: "Wu, Chen, Zhang, et al.",
                year: 2023,
                href: "https://arxiv.org/abs/2211.06687",
              },
              {
                title:
                  "UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction",
                authors: "McInnes, Healy, Melville",
                year: 2018,
                href: "https://arxiv.org/abs/1802.03426",
              },
              {
                title: "FMA: A Dataset for Music Analysis",
                authors: "Defferrard, Benzi, Vandergheynst, Bresson",
                year: 2017,
                href: "https://arxiv.org/abs/1612.01840",
              },
            ]}
          />
        </main>
      </div>
    </div>
  );
}
