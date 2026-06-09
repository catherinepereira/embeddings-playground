import { Card, Label, Prose, Section, Term } from "@/components/Section";
import { CompareTwoTracks } from "@/components/CompareTwoTracks";

export function WhatIsAnEmbedding() {
  return (
    <Section
      id="what-is-an-embedding"
      number="02"
      title="What is an embedding?"
      blurb="An embedding turns an item (a word, an image, a song) into a vector, such that similar items are positioned near each other."
    >
      <Prose>
        <p>
          A machine learning model can't listen to and compare two songs the way
          you can. It needs a numerical representation of the audio data. An{" "}
          <a
            href="https://en.wikipedia.org/wiki/Word_embedding"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            <Term>embedding</Term>
          </a>{" "}
          is a vector (a fixed-length list of numbers) that stands in for the
          original item. Here, each audio track becomes a vector of 512 numbers.
        </p>
        <p>
          The key insight from embeddings is how they are positioned relative to
          each other. A well-trained embedding will result in items with similar
          meaning ending up close together, and items with different meanings
          ending up far apart. The relative distance of embeddings from each
          other can then become a measure of similarity.
        </p>
      </Prose>
      <Card>
        <Label>Compare two embeddings</Label>
        <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
          Each strip is one track's embedding, with each number drawn as a
          colored cell. We can measure how alike two tracks are with{" "}
          <a
            href="https://en.wikipedia.org/wiki/Cosine_similarity"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-blue-600 dark:hover:text-blue-400"
          >
            cosine similarity
          </a>
          , which is the dot product of the two vectors divided by the product
          of their magnitudes. Pick a new random pair to see how the strips and
          the score change between various audio tracks.
        </p>
        <CompareTwoTracks />
      </Card>
    </Section>
  );
}
