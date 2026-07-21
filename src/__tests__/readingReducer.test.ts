import { describe, expect, it } from "vitest";

import { CARDS } from "@/lib/data/cards";
import { SPREADS } from "@/lib/data/spreads";
import {
  createInitialReadingState,
  isReadingComplete,
  readingReducer,
  type ReadingState,
} from "@/lib/state/readingReducer";
import type { DrawnCard } from "@/lib/types";

const spread = SPREADS[0];
const cards: DrawnCard[] = spread.positions.map((position, index) => ({
  card: CARDS[index],
  position,
  isReversed: index % 2 === 1,
}));

function readyState(): ReadingState {
  let state = readingReducer(createInitialReadingState(), { type: "SELECT_SPREAD", spread });
  state = readingReducer(state, {
    type: "SET_QUESTION",
    category: "career",
    question: "  下一步   怎么走？ ",
  });
  state = readingReducer(state, { type: "START_READING", cards });
  return readingReducer(state, { type: "FINISH_SHUFFLE" });
}

describe("reading reducer", () => {
  it("normalizes input and moves through the reading phases", () => {
    const state = readyState();
    expect(state.question).toBe("下一步 怎么走？");
    expect(state.phase).toBe("revealing");
    expect(state.drawnCards).toEqual(cards);
  });

  it("reveals with a new Set and derives completion", () => {
    const state = readyState();
    const first = readingReducer(state, { type: "REVEAL_CARD", positionIndex: 0 });
    expect(first.revealedIndices).not.toBe(state.revealedIndices);
    expect(state.revealedIndices.size).toBe(0);
    expect(first.activePositionIndex).toBe(1);

    const second = readingReducer(first, { type: "REVEAL_CARD", positionIndex: 1 });
    const complete = readingReducer(second, { type: "REVEAL_CARD", positionIndex: 2 });
    expect(isReadingComplete(second)).toBe(false);
    expect(isReadingComplete(complete)).toBe(true);
    expect(readingReducer(complete, { type: "REVEAL_CARD", positionIndex: 2 })).toBe(complete);
  });

  it("clears incompatible state when selecting a spread and on reset", () => {
    const state = readyState();
    const changed = readingReducer(state, { type: "SELECT_SPREAD", spread: SPREADS[2] });
    expect(changed.spread).toBe(SPREADS[2]);
    expect(changed.category).toBeNull();
    expect(changed.drawnCards).toEqual([]);
    expect(changed.revealedIndices.size).toBe(0);

    const reset = readingReducer(state, { type: "RESET" });
    expect(reset).toEqual(createInitialReadingState());
    expect(reset.revealedIndices).not.toBe(state.revealedIndices);
  });

  it("rejects an incomplete generated draw", () => {
    const state = readingReducer(createInitialReadingState(), { type: "SELECT_SPREAD", spread });
    expect(() => readingReducer(state, { type: "START_READING", cards: cards.slice(1) })).toThrow(
      /complete generated draw/,
    );
  });

  it("clones restored arrays and Sets", () => {
    const stored = readyState();
    stored.revealedIndices.add(0);
    const restored = readingReducer(createInitialReadingState(), {
      type: "RESTORE_SESSION",
      state: stored,
    });
    expect(restored.drawnCards).not.toBe(stored.drawnCards);
    expect(restored.revealedIndices).not.toBe(stored.revealedIndices);
    expect(restored.revealedIndices).toEqual(new Set([0]));
  });
});
