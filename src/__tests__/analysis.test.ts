import { describe, expect, it } from "vitest";

import { CARDS } from "@/lib/data/cards";
import { SPREADS } from "@/lib/data/spreads";
import { analyzeRelationships, generateReading, getDomainText } from "@/lib/engine/analysis";
import type {
  DrawnCard,
  OrientationMeaning,
  QuestionCategory,
  RelationshipKind,
} from "@/lib/types";

function draw(cardIds: number[], spreadIndex: number, reversed: boolean[] = []): DrawnCard[] {
  return cardIds.map((cardId, index) => ({
    card: CARDS[cardId],
    position: SPREADS[spreadIndex].positions[index],
    isReversed: reversed[index] ?? false,
  }));
}

describe("domain meaning fallback", () => {
  it("covers all six categories with a domain value or the general fallback", () => {
    const meaning: OrientationMeaning = {
      keywords: ["观察", "边界", "行动"],
      summary: "一般解释",
      advice: "建议",
      caution: "提醒",
      domains: { career: "事业解释" },
    };
    const expected: Record<QuestionCategory, string> = {
      general: "一般解释",
      relationship: "一般解释",
      career: "事业解释",
      study: "一般解释",
      finance: "一般解释",
      family: "一般解释",
    };
    for (const [category, text] of Object.entries(expected)) {
      expect(getDomainText(meaning, category as QuestionCategory)).toBe(text);
    }
  });
});

describe("reading analysis", () => {
  it("changes the contextual lens when the question category changes", () => {
    const cards = draw([0, 2, 43], 0);
    const career = generateReading(cards, "career");
    const relationship = generateReading(cards, "relationship");

    expect(career.positions[0].text).toContain("工作方向与协作");
    expect(relationship.positions[0].text).toContain("关系互动与边界");
    expect(career.positions[0].text).not.toBe(relationship.positions[0].text);
  });

  it("is deterministic for the same draw and includes timeline relationships", () => {
    const cards = draw([0, 2, 43], 0, [false, true, false]);
    const first = generateReading(cards, "career");
    const second = generateReading(cards, "career");

    expect(second).toEqual(first);
    expect(first.signature).toBe("career|1:0:0|2:2:1|3:43:0");
    expect(first.positions).toHaveLength(3);
    expect(first.relationships.map((item) => item.kind)).toContain("timeline-shift");
    expect(first.relationships.map((item) => item.kind)).toContain("major-concentration");
    expect(JSON.stringify(first)).not.toMatch(/undefined/);
  });

  it("uses stable theme variants while keeping identical draws reproducible", () => {
    const firstDraw = draw([0, 2, 43], 0);
    const secondDraw = draw([2, 6, 11], 0);

    expect(generateReading(firstDraw, "career").theme).toBe(
      generateReading(firstDraw, "career").theme,
    );
    expect(generateReading(firstDraw, "career").theme).not.toBe(
      generateReading(secondDraw, "career").theme,
    );
  });

  it("builds a balanced two-paths comparison without choosing for the user", () => {
    const cards = draw([0, 2, 13, 24, 43], 2, [false, false, true, false, true]);
    const insights = analyzeRelationships(cards);
    const comparison = insights.find((item) => item.kind === "two-paths");

    expect(comparison?.relatedPositionIndices).toEqual([2, 3, 4, 5]);
    expect(comparison?.text).toContain("不替你决定");
  });

  it("links the core, support, obstacle, advice and outcome in a hexagram", () => {
    const cards = draw([0, 2, 6, 11, 13, 14, 24], 1, [false, true, false, false, true]);
    const kinds = analyzeRelationships(cards).map((item) => item.kind);

    expect(kinds).toContain("core-obstacle");
    expect(kinds).toContain("support-obstacle");
    expect(kinds).toContain("advice-outcome");
  });

  it("reports a unique dominant suit but not a tied suit count", () => {
    const dominant = draw([22, 23, 24, 36, 0], 2);
    const tied = draw([22, 23, 36, 37, 0], 2);

    expect(analyzeRelationships(dominant).map((item) => item.kind)).toContain("dominant-suit");
    expect(analyzeRelationships(tied).map((item) => item.kind)).not.toContain("dominant-suit");
  });

  it("only reports orientation patterns when the configured boundary is met", () => {
    const mixed = draw([0, 2, 43], 0, [true, false, false]);
    const reversedMajority = draw([0, 2, 43], 0, [true, true, false]);

    expect(analyzeRelationships(mixed).map((item) => item.kind)).not.toContain(
      "orientation-pattern",
    );
    expect(analyzeRelationships(reversedMajority).map((item) => item.kind)).toContain(
      "orientation-pattern",
    );
  });

  it("covers positive, negative and threshold cases for concentration rules", () => {
    const kinds = (cards: DrawnCard[]) => analyzeRelationships(cards).map((item) => item.kind);

    expect(kinds(draw([0, 2, 22], 0))).toContain("major-concentration");
    expect(kinds(draw([0, 22, 36], 0))).not.toContain("major-concentration");
    expect(kinds(draw([0, 2, 6], 0))).toContain("major-concentration");

    expect(kinds(draw([22, 23, 24, 36, 0], 2))).toContain("dominant-suit");
    expect(kinds(draw([22, 36, 50, 64, 0], 2))).not.toContain("dominant-suit");
    expect(kinds(draw([22, 23, 36, 37, 0], 2))).not.toContain("dominant-suit");

    expect(kinds(draw([0, 2, 43], 0))).toContain("orientation-pattern");
    expect(kinds(draw([0, 2, 43], 0, [true, false, false]))).not.toContain("orientation-pattern");
    expect(kinds(draw([0, 2, 43], 0, [true, true, false]))).toContain("orientation-pattern");
  });

  it("only emits role relationship rules when every required position is present", () => {
    const allKinds = (cards: DrawnCard[]) =>
      new Set(analyzeRelationships(cards).map((item) => item.kind));
    const timeline = draw([0, 22, 36], 0);
    const hexagram = draw([0, 22, 36, 50, 64, 23, 37], 1);
    const paths = draw([0, 22, 36, 50, 64], 2);

    expect(allKinds(timeline)).toContain("timeline-shift");
    expect(allKinds(timeline.slice(0, 2))).not.toContain("timeline-shift");
    expect(
      allKinds([...timeline, { ...timeline[2], position: SPREADS[1].positions[1] }]),
    ).not.toContain("timeline-shift");

    const pairedKinds: RelationshipKind[] = ["core-obstacle", "support-obstacle", "advice-outcome"];
    for (const kind of pairedKinds) expect(allKinds(hexagram)).toContain(kind);
    expect(allKinds(hexagram.filter((item) => item.position.role !== "obstacle"))).not.toContain(
      "core-obstacle",
    );
    expect(allKinds(hexagram.filter((item) => item.position.role !== "support"))).not.toContain(
      "support-obstacle",
    );
    expect(allKinds(hexagram.filter((item) => item.position.role !== "outcome"))).not.toContain(
      "advice-outcome",
    );

    expect(allKinds(paths)).toContain("two-paths");
    expect(allKinds(paths.filter((item) => item.position.role !== "option-cost"))).not.toContain(
      "two-paths",
    );
    expect(allKinds(paths.slice(0, 3))).toContain("two-paths");
  });

  it.each([
    { spreadIndex: 0, cardIds: [0, 2, 43] },
    { spreadIndex: 1, cardIds: [0, 2, 6, 11, 13, 14, 24] },
    { spreadIndex: 2, cardIds: [0, 2, 13, 24, 43] },
  ])(
    "keeps the fixed example for spread $spreadIndex structurally complete",
    ({ spreadIndex, cardIds }) => {
      const spread = SPREADS[spreadIndex];
      const result = generateReading(draw(cardIds, spreadIndex), "general");

      expect(result.positions).toHaveLength(spread.cardCount);
      expect(result.positions.map((item) => item.positionIndex)).toEqual(
        spread.positions.map((item) => item.index),
      );
      expect(result.theme.trim()).not.toBe("");
      expect(result.nextStep.trim()).not.toBe("");
      expect(result.disclaimer).toContain("不构成");
      expect(result.relationships.length).toBeGreaterThan(0);
    },
  );
});
