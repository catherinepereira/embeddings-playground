export interface VizPoint {
  id: number;
  x: number;
  y: number;
  z: number;
  x2: number;
  y2: number;
  title: string | null;
  artist: string | null;
  genre: string;
  color: string;
  audio_url: string;
  track_url: string | null;
  artist_url: string | null;
}

export interface VizData {
  points: VizPoint[];
  genre_colors: Record<string, string>;
  meta: {
    n_tracks: number;
    umap_n_neighbors: number;
    umap_min_dist: number;
    embedding_dim: number;
    model: string;
  };
}
