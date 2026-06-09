import { Card, Label, Prose, Section, Term } from "@/components/Section";
import { ProjectedCoords } from "@/components/ProjectedCoords";

export function SeeingHighDimensions() {
  return (
    <Section
      id="seeing-high-dimensions"
      number="04"
      title="Dimensionality reduction"
      blurb="You can't easily visualize a 512-dimensional point, so we use UMAP to reduce each one to 2D or 3D."
    >
      <Prose>
        <p>
          Reducing 512 dimensions to 2 or 3 dimensions would discard most of the
          information in the embedding, so the goal is to keep the most useful
          parts.{" "}
          <a
            href="https://umap-learn.readthedocs.io"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            UMAP
          </a>{" "}
          (Uniform Manifold Approximation and Projection) is a{" "}
          <Term>dimensionality reduction</Term> method.
        </p>
        <p>
          It builds a graph of each point's nearest neighbors in the full 512D
          space, then arranges that graph in 2D or 3D such that related points
          stay close together. A tight cluster in the plot at the top of this
          page is a group of tracks that had similar CLAP vectors, which usually
          means they sound alike or had similar qualities.
        </p>
        <p>
          However, a cluster being on the left versus the right does not have
          meaning in the graphical representation of the embeddings, nor does
          the absolute distance between points or clusters. What matters is the
          relative tightness of the clusters and relative distance between
          points or clusters, as compared to the entire space that the vector
          space takes up.
        </p>
      </Prose>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <Label>n_neighbors = 15</Label>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
            How many nearby points UMAP looks at when building the graph. Small
            values focus on fine local structure and break the data into many
            small clusters. Large values weigh the broader shape of the data, so
            the overall layout is preserved at the cost of local detail.
          </p>
        </Card>
        <Card>
          <Label>min_dist = 0.1</Label>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
            How tightly points are allowed to pack together in the 2D or 3D
            layout. Low values let clusters clump densely, which makes groups
            easy to spot. High values spread points out more evenly.
          </p>
        </Card>
      </div>

      <Card>
        <Label>Reduced dimensions</Label>
        <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
          The same two tracks from the comparison above, showing the 2D and 3D
          coordinates UMAP reduced their 512-D vectors to.
        </p>
        <ProjectedCoords />
      </Card>
    </Section>
  );
}
