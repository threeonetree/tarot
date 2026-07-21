import type {
  DrawnCard,
  GeneratedReading,
  OrientationMeaning,
  PositionReading,
  QuestionCategory,
  RelationshipInsight,
} from "@/lib/types";

const roleLead = {
  origin: "作为问题的背景，它提示",
  current: "放在当前核心位置，它提示",
  goal: "作为你所期待的方向，它提示",
  support: "作为可以借用的助力，它提示",
  obstacle: "作为需要正视的阻碍，它提示",
  advice: "作为行动建议，它提示",
  outcome: "作为当前路径的可能趋势，它提示",
  "option-benefit": "作为这条路径的潜在优势，它提示",
  "option-cost": "作为这条路径需要承担的挑战，它提示",
} as const;

const themeTemplates = [
  (keywords: string) => `这组牌首先强调“${keywords}”，并邀请你把象征提示与现实信息一起核对。`,
  (keywords: string) =>
    `“${keywords}”构成了这次解读的主线；先观察它在现实中的对应，再决定如何行动。`,
  (keywords: string) => `本次牌面围绕“${keywords}”展开，适合把直觉感受与已经掌握的事实放在一起看。`,
] as const;

function stableIndex(value: string, length: number): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

function orientationOf(item: DrawnCard): OrientationMeaning {
  return item.isReversed ? item.card.reversed : item.card.upright;
}

export function getDomainText(meaning: OrientationMeaning, category: QuestionCategory): string {
  if (category === "general") return meaning.summary;
  const domainText = meaning.domains[category]?.trim();
  return domainText || meaning.summary;
}

function reflectionFor(item: DrawnCard, meaning: OrientationMeaning): string {
  if (item.position.role === "advice") return meaning.advice;
  if (item.position.role === "obstacle" || item.position.role === "option-cost") {
    return meaning.caution;
  }
  return meaning.advice;
}

function positionReading(item: DrawnCard, category: QuestionCategory): PositionReading {
  const meaning = orientationOf(item);
  const orientation = item.isReversed ? "reversed" : "upright";
  return {
    positionIndex: item.position.index,
    positionLabel: item.position.label,
    cardId: item.card.id,
    cardName: item.card.name,
    orientation,
    keywords: [...meaning.keywords],
    text: `${roleLead[item.position.role]}：${getDomainText(meaning, category)}`,
    reflection: reflectionFor(item, meaning),
  };
}

function majorInsight(cards: readonly DrawnCard[]): RelationshipInsight | undefined {
  const majors = cards.filter((item) => item.card.type === "major");
  if (majors.length < Math.ceil(cards.length / 2)) return undefined;
  return {
    kind: "major-concentration",
    relatedPositionIndices: majors.map((item) => item.position.index),
    text: "大阿卡纳占据了较多位置，说明这次梳理更偏向阶段性主题与价值选择，而不只是短期细节。",
  };
}

function suitInsight(cards: readonly DrawnCard[]): RelationshipInsight | undefined {
  const counts = new Map<string, DrawnCard[]>();
  for (const item of cards) {
    if (!item.card.suit) continue;
    counts.set(item.card.suit, [...(counts.get(item.card.suit) ?? []), item]);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1].length - a[1].length);
  if (!sorted[0] || sorted[0][1].length < 2 || sorted[0][1].length === sorted[1]?.[1].length) {
    return undefined;
  }
  const suitText = {
    cups: "情感与关系",
    swords: "判断、沟通与认知",
    wands: "行动、动力与创造",
    pentacles: "资源、现实条件与长期建设",
  }[sorted[0][0]];
  return {
    kind: "dominant-suit",
    relatedPositionIndices: sorted[0][1].map((item) => item.position.index),
    text: `同一花色多次出现，${suitText}可能是这组牌反复强调的观察维度。`,
  };
}

function orientationInsight(cards: readonly DrawnCard[]): RelationshipInsight | undefined {
  const reversed = cards.filter((item) => item.isReversed);
  if (reversed.length === 0) {
    return {
      kind: "orientation-pattern",
      relatedPositionIndices: cards.map((item) => item.position.index),
      text: "全部为正位，当前信息更偏向外显行动；仍需结合现实条件，而不是把顺畅理解为必然成功。",
    };
  }
  if (reversed.length === cards.length) {
    return {
      kind: "orientation-pattern",
      relatedPositionIndices: reversed.map((item) => item.position.index),
      text: "全部为逆位，阻滞可能更多发生在内在判断、准备程度或表达方式上，并不等同于全部结果都负面。",
    };
  }
  if (reversed.length > cards.length / 2) {
    return {
      kind: "orientation-pattern",
      relatedPositionIndices: reversed.map((item) => item.position.index),
      text: "逆位较多，适合先处理尚未说清、尚未准备好或反复回避的部分，再推动外部行动。",
    };
  }
  return undefined;
}

function pairedInsight(
  cards: readonly DrawnCard[],
  kind: RelationshipInsight["kind"],
  roles: readonly [DrawnCard["position"]["role"], DrawnCard["position"]["role"]],
  text: string,
): RelationshipInsight | undefined {
  const pair = roles.map((role) => cards.find((item) => item.position.role === role));
  if (!pair[0] || !pair[1]) return undefined;
  return {
    kind,
    relatedPositionIndices: [pair[0].position.index, pair[1].position.index],
    text,
  };
}

export function analyzeRelationships(cards: readonly DrawnCard[]): RelationshipInsight[] {
  const insights: Array<RelationshipInsight | undefined> = [
    majorInsight(cards),
    suitInsight(cards),
    orientationInsight(cards),
  ];
  const roles = new Set(cards.map((item) => item.position.role));
  if (roles.has("origin") && roles.has("current") && roles.has("outcome") && cards.length === 3) {
    insights.push({
      kind: "timeline-shift",
      relatedPositionIndices: cards.map((item) => item.position.index),
      text: "过去、现在与未来描述的是条件如何变化；未来位置只是沿当前路径延伸出的趋势，不是固定结论。",
    });
  }
  insights.push(
    pairedInsight(
      cards,
      "core-obstacle",
      ["current", "obstacle"],
      "把核心状态与阻碍放在一起看，可以区分问题本身和阻碍问题推进的条件。",
    ),
    pairedInsight(
      cards,
      "support-obstacle",
      ["support", "obstacle"],
      "助力与阻碍同时存在；更实用的问题是如何让已有资源准确作用于限制。",
    ),
    pairedInsight(
      cards,
      "advice-outcome",
      ["advice", "outcome"],
      "建议位置提供可调整的方向，结果位置则呈现维持当前条件时更可能出现的走向。",
    ),
  );
  if (roles.has("option-benefit") && roles.has("option-cost")) {
    insights.push({
      kind: "two-paths",
      relatedPositionIndices: cards
        .filter((item) => item.position.option)
        .map((item) => item.position.index),
      text: "两条路径各自包含优势与代价；牌面用于帮助你比较取舍，不替你决定哪一条必然更好。",
    });
  }
  return insights.filter((item): item is RelationshipInsight => Boolean(item));
}

function signature(cards: readonly DrawnCard[], category: QuestionCategory): string {
  return [
    category,
    ...cards.map((item) => `${item.position.index}:${item.card.id}:${Number(item.isReversed)}`),
  ].join("|");
}

export function generateReading(
  cards: readonly DrawnCard[],
  category: QuestionCategory,
): GeneratedReading {
  if (!cards.length) throw new RangeError("生成解读时至少需要一张牌。");
  const positions = cards.map((item) => positionReading(item, category));
  const relationships = analyzeRelationships(cards);
  const first = positions[0];
  const readingSignature = signature(cards, category);
  const themeTemplate = themeTemplates[stableIndex(readingSignature, themeTemplates.length)];
  const theme = themeTemplate(first.keywords.slice(0, 2).join("、"));
  const adviceSource =
    cards.find((item) => item.position.role === "advice") ?? cards[cards.length - 1];
  return {
    signature: readingSignature,
    theme,
    positions,
    relationships,
    nextStep: orientationOf(adviceSource).advice,
    disclaimer: "塔罗解读用于自我反思，不构成医疗、法律、财务或其他专业建议，也不代表确定的未来。",
  };
}
