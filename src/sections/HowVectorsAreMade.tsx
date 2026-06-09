import { Card, Label, Prose, Section } from "@/components/Section";
import { GenreAverage } from "@/components/GenreAverage";

export function HowVectorsAreMade() {
  return (
    <Section
      id="how-vectors-are-made"
      number="03"
      title="From audio to a vector"
      blurb="The embeddings here come from CLAP, a model trained to give matching audio and text similar vectors."
    >
      <Prose>
        <p>
          The encoder is{" "}
          <a
            href="https://github.com/LAION-AI/CLAP"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            CLAP
          </a>{" "}
          (Contrastive Language-Audio Pretraining). It was trained on audio-text
          pairs with the objective to give a clip and its caption similar
          vectors, and give a clip and a caption that don't match dissimilar
          vectors. Over many pairs, the audio encoder learns to represent the
          qualities that captions describe, such as tempo, timbre, and genre.
        </p>
        <p>
          The model was never given genre labels directly. It learned that clips
          with jazz-like captions get similar vectors, so it gives new jazz
          clips similar vectors too.
        </p>
      </Prose>

      <Card>
        <Label>Average embedding by genre</Label>

        <GenreAverage />
      </Card>
    </Section>
  );
}
