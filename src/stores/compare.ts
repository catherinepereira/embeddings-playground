import { create } from "zustand";
import type { VizPoint } from "@/lib/types";

// Two comparison slots shared across sections: the explorer's Set as A / Set as
// B buttons write here, and the section 02 compare panel reads from it
type CompareState = {
  slotA: VizPoint | null;
  slotB: VizPoint | null;
  setA: (point: VizPoint) => void;
  setB: (point: VizPoint) => void;
  setPair: (a: VizPoint, b: VizPoint) => void;
};

export const useCompareStore = create<CompareState>((set) => ({
  slotA: null,
  slotB: null,
  setA: (point) => set({ slotA: point }),
  setB: (point) => set({ slotB: point }),
  setPair: (a, b) => set({ slotA: a, slotB: b }),
}));
