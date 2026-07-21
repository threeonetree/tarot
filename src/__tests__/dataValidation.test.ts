import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CARDS, REVIEWED_CARD_IDS } from "@/lib/data/cards";
import { SPREADS } from "@/lib/data/spreads";
import { assertValidData, validateDeck, validateSpreads } from "@/lib/engine/validation";

describe("tarot data", () => {
  it("contains a structurally valid 78-card deck", () => {
    const result = validateDeck(CARDS);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("uses the agreed deterministic ID mapping", () => {
    expect(CARDS[24].name).toBe("圣杯三");
    expect(CARDS[43].name).toBe("宝剑八");
    expect(CARDS[77].name).toBe("星币国王");
    expect(REVIEWED_CARD_IDS).toEqual(Array.from({ length: 78 }, (_, index) => index));
  });

  it("opens the release gate only after every card has reviewed content and finished art", () => {
    const result = validateDeck(CARDS, "release");
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("ships a local, script-free illustration for every card", () => {
    for (const card of CARDS) {
      const path = join(process.cwd(), "public", card.illustrationPath);
      const source = readFileSync(path, "utf8");
      expect(source).toContain("<svg");
      expect(source).not.toMatch(/<script|(?:xlink:)?href=["']https?:|onload=/i);
    }
  });

  it("uses card-specific number-card narratives instead of suit-name substitution", () => {
    const numberCards = CARDS.filter(
      (card) =>
        card.type === "minor" &&
        card.rank &&
        !["page", "knight", "queen", "king"].includes(card.rank),
    );
    expect(numberCards).toHaveLength(40);
    expect(new Set(numberCards.map((card) => card.upright.summary)).size).toBe(40);
    expect(new Set(numberCards.map((card) => card.reversed.summary)).size).toBe(40);
  });

  it("keeps sensitive cards reflective and non-threatening", () => {
    const sensitive = [13, 15, 16, 38, 45, 47].map((id) => CARDS[id]);
    const text = JSON.stringify(sensitive);
    expect(text).not.toMatch(/注定|诅咒|附身|必然会|一定会|死亡预告/);
    expect(CARDS[13].upright.caution).toContain("不等同于现实灾难");
  });

  it("contains three valid spreads", () => {
    const result = validateSpreads(SPREADS);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("rejects malformed deck data before it can reach a production build", () => {
    const malformedDeck = CARDS.map((card, index) =>
      index === 1 ? { ...card, id: CARDS[0].id } : card,
    );
    const result = validateDeck(malformedDeck);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("重复 ID"),
        expect.stringContaining("完整覆盖 0–77"),
      ]),
    );
    expect(() => assertValidData(malformedDeck, SPREADS)).toThrow("塔罗数据校验失败");
  });

  it("rejects a spread whose declared card count differs from its positions", () => {
    const malformedSpreads = SPREADS.map((spread) =>
      spread.id === "three-card" ? { ...spread, cardCount: 2 } : spread,
    );
    const result = validateSpreads(malformedSpreads);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("three-card 的 cardCount 与位置数不一致。");
    expect(() => assertValidData(CARDS, malformedSpreads)).toThrow("塔罗数据校验失败");
  });
});
