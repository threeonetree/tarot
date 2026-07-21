import type { MinorRank, Spread, Suit, TarotCard } from "@/lib/types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const expectedSuits: readonly Suit[] = ["cups", "swords", "wands", "pentacles"];
const expectedRanks: readonly MinorRank[] = [
  "ace",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "page",
  "knight",
  "queen",
  "king",
];

function duplicates<T>(values: readonly T[]): T[] {
  const seen = new Set<T>();
  const repeated = new Set<T>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function validateDeck(
  cards: readonly TarotCard[],
  mode: "structural" | "release" = "structural",
): ValidationResult {
  const errors: string[] = [];

  if (cards.length !== 78) errors.push(`牌组应为 78 张，实际为 ${cards.length} 张。`);

  const duplicateIds = duplicates(cards.map((card) => card.id));
  if (duplicateIds.length) errors.push(`存在重复 ID：${duplicateIds.join(", ")}。`);

  const expectedIds = Array.from({ length: 78 }, (_, index) => index);
  const actualIds = [...cards.map((card) => card.id)].sort((a, b) => a - b);
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    errors.push("牌组 ID 必须完整覆盖 0–77。 ");
  }

  const majors = cards.filter((card) => card.type === "major");
  const minors = cards.filter((card) => card.type === "minor");
  if (majors.length !== 22) errors.push(`大阿卡纳应为 22 张，实际为 ${majors.length} 张。`);
  if (minors.length !== 56) errors.push(`小阿卡纳应为 56 张，实际为 ${minors.length} 张。`);

  for (const card of cards) {
    if (!hasText(card.name) || !hasText(card.nameEn)) errors.push(`ID ${card.id} 缺少牌名。`);
    if (!hasText(card.illustrationPath)) errors.push(`ID ${card.id} 缺少插画路径。`);
    if (card.type === "major" && (card.suit || card.rank)) {
      errors.push(`大阿卡纳 ID ${card.id} 不应包含花色或 rank。`);
    }
    if (card.type === "minor" && (!card.suit || !card.rank)) {
      errors.push(`小阿卡纳 ID ${card.id} 缺少花色或 rank。`);
    }

    for (const [orientation, item] of [
      ["正位", card.upright],
      ["逆位", card.reversed],
    ] as const) {
      if (item.keywords.length < 3) errors.push(`ID ${card.id} ${orientation}关键词少于 3 个。`);
      if (![item.summary, item.advice, item.caution].every(hasText)) {
        errors.push(`ID ${card.id} ${orientation}核心字段存在空值。`);
      }
    }

    if (mode === "release") {
      if (card.contentStatus !== "reviewed") errors.push(`ID ${card.id} 内容尚未审核。`);
      if (card.illustrationPath.includes("/pending/")) errors.push(`ID ${card.id} 插画尚未完成。`);
    }
  }

  for (const suit of expectedSuits) {
    const suitCards = minors.filter((card) => card.suit === suit);
    if (suitCards.length !== 14) errors.push(`${suit} 应为 14 张，实际为 ${suitCards.length} 张。`);
    const ranks = suitCards
      .map((card) => card.rank)
      .filter((rank): rank is MinorRank => Boolean(rank));
    if (duplicates(ranks).length || expectedRanks.some((rank) => !ranks.includes(rank))) {
      errors.push(`${suit} 的 rank 不完整或存在重复。`);
    }
  }

  const duplicatePaths = duplicates(cards.map((card) => card.illustrationPath));
  if (duplicatePaths.length) errors.push(`插画路径重复：${duplicatePaths.join(", ")}。`);

  return { valid: errors.length === 0, errors };
}

export function validateSpreads(spreads: readonly Spread[]): ValidationResult {
  const errors: string[] = [];
  if (spreads.length !== 3) errors.push(`牌阵应为 3 个，实际为 ${spreads.length} 个。`);

  const duplicateSpreadIds = duplicates(spreads.map((spread) => spread.id));
  if (duplicateSpreadIds.length) errors.push(`牌阵 ID 重复：${duplicateSpreadIds.join(", ")}。`);

  for (const spread of spreads) {
    if (spread.cardCount !== spread.positions.length) {
      errors.push(`${spread.id} 的 cardCount 与位置数不一致。`);
    }
    const indices = spread.positions.map((position) => position.index);
    const expected = Array.from({ length: spread.cardCount }, (_, index) => index + 1);
    if (JSON.stringify([...indices].sort((a, b) => a - b)) !== JSON.stringify(expected)) {
      errors.push(`${spread.id} 的位置 index 必须从 1 连续编号。`);
    }
    if (duplicates(indices).length) errors.push(`${spread.id} 存在重复位置 index。`);
    if (duplicates(spread.positions.map((position) => position.layoutSlot)).length) {
      errors.push(`${spread.id} 存在重复 layoutSlot。`);
    }
    if (spread.id === "two-paths") {
      const optionPositions = spread.positions.filter((position) => position.option);
      if (optionPositions.filter((position) => position.option === "A").length !== 2) {
        errors.push("two-paths 必须包含两个 A 路径位置。 ");
      }
      if (optionPositions.filter((position) => position.option === "B").length !== 2) {
        errors.push("two-paths 必须包含两个 B 路径位置。 ");
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidData(cards: readonly TarotCard[], spreads: readonly Spread[]): void {
  const results = [validateDeck(cards), validateSpreads(spreads)];
  const errors = results.flatMap((result) => result.errors);
  if (errors.length) throw new Error(`塔罗数据校验失败：\n${errors.join("\n")}`);
}
