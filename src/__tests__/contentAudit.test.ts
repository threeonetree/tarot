import { describe, expect, it } from "vitest";

import { CARDS } from "@/lib/data/cards";
import { SPREADS } from "@/lib/data/spreads";
import { generateReading } from "@/lib/engine/analysis";
import type { DrawnCard, QuestionCategory } from "@/lib/types";

const categories: QuestionCategory[] = [
  "general",
  "relationship",
  "career",
  "study",
  "finance",
  "family",
];

function fixedDraw(spreadIndex: number, offset: number): DrawnCard[] {
  const spread = SPREADS[spreadIndex];
  return spread.positions.map((position, index) => ({
    card: CARDS[(offset * 7 + index * 11) % CARDS.length],
    position,
    isReversed: (offset + index) % 3 === 0,
  }));
}

describe("v1 content audit", () => {
  it("reviews thirty fixed readings for safety, completeness and duplicate output", () => {
    for (let index = 0; index < 30; index += 1) {
      const spreadIndex = index % SPREADS.length;
      const reading = generateReading(fixedDraw(spreadIndex, index), categories[index % 6]);
      const serialized = JSON.stringify(reading);
      const relationshipTexts = reading.relationships.map((item) => item.text);

      expect(reading.positions).toHaveLength(SPREADS[spreadIndex].cardCount);
      expect(reading.theme.trim()).not.toBe("");
      expect(reading.nextStep.trim()).not.toBe("");
      expect(reading.disclaimer).toContain("不构成医疗、法律、财务");
      expect(serialized).not.toMatch(/注定|诅咒|附身|必然会|一定会|死亡预告/);
      expect(new Set(relationshipTexts).size).toBe(relationshipTexts.length);

      for (const position of reading.positions) {
        expect(position.text.trim()).not.toBe("");
        expect(position.reflection.trim()).not.toBe("");
        if (position.positionLabel === "未来" || position.positionLabel === "结果") {
          expect(position.text).toMatch(/可能|趋势|提示|条件/);
        }
      }
    }
  });

  it("keeps every two-paths reading neutral", () => {
    for (let index = 0; index < 10; index += 1) {
      const reading = generateReading(fixedDraw(2, index + 40), categories[index % 6]);
      const comparison = reading.relationships.find((item) => item.kind === "two-paths");
      expect(comparison?.text).toContain("不替你决定");
      expect(comparison?.text).not.toMatch(/选择 A|选择 B|更好的是|必须选/);
    }
  });
});
