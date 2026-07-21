import { describe, expect, it } from "vitest";
import { CARDS } from "@/lib/data/cards";
import { SPREADS } from "@/lib/data/spreads";
import { drawCards, shuffle } from "@/lib/engine/draw";

describe("shuffle", () => {
  it("returns a new array without modifying input", () => {
    const input = [1, 2, 3] as const;
    const result = shuffle(input, () => 0);
    expect(result).toEqual([2, 3, 1]);
    expect(input).toEqual([1, 2, 3]);
    expect(result).not.toBe(input);
  });

  it("rejects an invalid random source", () => {
    expect(() => shuffle([1, 2], () => 1)).toThrow(RangeError);
    expect(() => shuffle([1, 2], () => -0.1)).toThrow(RangeError);
  });
});

describe("drawCards", () => {
  it("draws unique cards and binds every position", () => {
    let calls = 0;
    const orientationValues = [0.1, 0.9, 0.1];
    const random = () => {
      const value = calls < 77 ? 0 : orientationValues[calls - 77];
      calls += 1;
      return value;
    };
    const positions = SPREADS[0].positions;
    const result = drawCards(CARDS, positions, random);

    expect(result).toHaveLength(3);
    expect(new Set(result.map((item) => item.card.id)).size).toBe(3);
    expect(result.map((item) => item.position.index)).toEqual([1, 2, 3]);
    expect(result.map((item) => item.isReversed)).toEqual([false, true, false]);
  });

  it("rejects an undersized deck", () => {
    expect(() => drawCards(CARDS.slice(0, 2), SPREADS[0].positions, () => 0)).toThrow(
      "牌库数量少于牌阵所需数量",
    );
  });
});
