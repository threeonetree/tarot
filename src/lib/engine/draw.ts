import type { DrawnCard, SpreadPosition, TarotCard } from "@/lib/types";

export type RandomSource = () => number;

function nextRandom(random: RandomSource): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError("随机源必须返回 [0, 1) 范围内的有限数值。");
  }
  return value;
}

export function shuffle<T>(input: readonly T[], random: RandomSource = Math.random): T[] {
  const result = [...input];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(nextRandom(random) * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function drawCards(
  deck: readonly TarotCard[],
  positions: readonly SpreadPosition[],
  random: RandomSource = Math.random,
): DrawnCard[] {
  if (!deck.length) throw new RangeError("牌库不能为空。");
  if (!positions.length) throw new RangeError("牌阵位置不能为空。");
  if (deck.length < positions.length) throw new RangeError("牌库数量少于牌阵所需数量。");

  const indices = positions.map((position) => position.index);
  if (new Set(indices).size !== indices.length) throw new RangeError("牌阵位置 index 不能重复。");

  return shuffle(deck, random)
    .slice(0, positions.length)
    .map((card, index) => ({
      card,
      isReversed: nextRandom(random) >= 0.5,
      position: positions[index],
    }));
}
