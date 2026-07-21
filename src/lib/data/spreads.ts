import type { Spread } from "@/lib/types";

export const SPREADS: readonly Spread[] = [
  {
    id: "three-card",
    name: "三张牌 · 时间之箭",
    shortName: "时间之箭",
    description: "从根源、当下与趋势，梳理问题正在如何发展。",
    cardCount: 3,
    layoutPattern: "linear",
    positions: [
      {
        index: 1,
        label: "过去",
        description: "已发生的背景或问题来源",
        role: "origin",
        layoutSlot: "left",
      },
      {
        index: 2,
        label: "现在",
        description: "当前状况或核心挑战",
        role: "current",
        layoutSlot: "center",
      },
      {
        index: 3,
        label: "未来",
        description: "按当前路径可能出现的趋势",
        role: "outcome",
        layoutSlot: "right",
      },
    ],
  },
  {
    id: "hexagram",
    name: "七张牌 · 星芒指引",
    shortName: "星芒指引",
    description: "从七个相互关联的位置理解复杂问题。",
    cardCount: 7,
    layoutPattern: "hexagram",
    positions: [
      {
        index: 1,
        label: "核心",
        description: "问题本质或当前核心状态",
        role: "current",
        layoutSlot: "center",
      },
      {
        index: 2,
        label: "目标",
        description: "期待的结果或理想方向",
        role: "goal",
        layoutSlot: "top",
      },
      {
        index: 3,
        label: "助力",
        description: "可以利用的资源和支持",
        role: "support",
        layoutSlot: "upper-right",
      },
      {
        index: 4,
        label: "阻碍",
        description: "限制、困难或需要承担的代价",
        role: "obstacle",
        layoutSlot: "lower-right",
      },
      {
        index: 5,
        label: "根源",
        description: "深层原因或未被看见的影响",
        role: "origin",
        layoutSlot: "bottom",
      },
      {
        index: 6,
        label: "建议",
        description: "可以考虑的行动或态度",
        role: "advice",
        layoutSlot: "upper-left",
      },
      {
        index: 7,
        label: "结果",
        description: "按当前路径可能出现的走向",
        role: "outcome",
        layoutSlot: "lower-left",
      },
    ],
  },
  {
    id: "two-paths",
    name: "五张牌 · 抉择之路",
    shortName: "抉择之路",
    description: "分别看见两条路径的优势与代价，不替你做决定。",
    cardCount: 5,
    layoutPattern: "two-paths",
    positions: [
      {
        index: 1,
        label: "现状",
        description: "当前选择的核心状态",
        role: "current",
        layoutSlot: "center",
      },
      {
        index: 2,
        label: "A 的优势",
        description: "A 路径可能带来的积极面",
        role: "option-benefit",
        layoutSlot: "left-top",
        option: "A",
      },
      {
        index: 3,
        label: "A 的挑战",
        description: "A 路径需要承担的风险或代价",
        role: "option-cost",
        layoutSlot: "left-bottom",
        option: "A",
      },
      {
        index: 4,
        label: "B 的优势",
        description: "B 路径可能带来的积极面",
        role: "option-benefit",
        layoutSlot: "right-top",
        option: "B",
      },
      {
        index: 5,
        label: "B 的挑战",
        description: "B 路径需要承担的风险或代价",
        role: "option-cost",
        layoutSlot: "right-bottom",
        option: "B",
      },
    ],
  },
] as const;

export function getSpreadById(id: string | null | undefined): Spread | undefined {
  return SPREADS.find((spread) => spread.id === id);
}
