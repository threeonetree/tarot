import { describe, expect, it } from "vitest";

import { normalizeText, parseReadingRequest, parseStoredDraw } from "@/lib/storage/sessionReading";

describe("session reading schema", () => {
  it("normalizes question text and preserves valid choices", () => {
    const parsed = parseReadingRequest(
      JSON.stringify({
        schemaVersion: 1,
        spreadId: "two-paths",
        category: "career",
        question: "  是否   接受新机会？  ",
        optionA: " 接受 ",
        optionB: " 留下 ",
      }),
    );
    expect(parsed).toEqual({
      schemaVersion: 1,
      spreadId: "two-paths",
      category: "career",
      question: "是否 接受新机会？",
      optionA: "接受",
      optionB: "留下",
    });
  });

  it("rejects corrupt or obsolete state", () => {
    expect(parseReadingRequest("not-json")).toBeUndefined();
    expect(
      parseReadingRequest(
        JSON.stringify({
          schemaVersion: 2,
          spreadId: "three-card",
          category: "general",
          question: "",
        }),
      ),
    ).toBeUndefined();
    expect(
      parseStoredDraw(JSON.stringify({ schemaVersion: 1, request: {}, cards: [] })),
    ).toBeUndefined();
  });

  it("deduplicates revealed indices", () => {
    const stored = parseStoredDraw(
      JSON.stringify({
        schemaVersion: 1,
        request: {
          schemaVersion: 1,
          spreadId: "three-card",
          category: "general",
          question: "",
        },
        cards: [
          { cardId: 0, isReversed: false, positionIndex: 1 },
          { cardId: 2, isReversed: true, positionIndex: 2 },
          { cardId: 13, isReversed: false, positionIndex: 3 },
        ],
        revealedIndices: [0, 0, 2],
      }),
    );
    expect(stored?.revealedIndices).toEqual([0, 2]);
    expect(normalizeText("  a   b  ", 4)).toBe("a b");
  });
});
