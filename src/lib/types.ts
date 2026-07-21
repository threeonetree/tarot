export type Suit = "cups" | "swords" | "wands" | "pentacles";

export type MinorRank =
  | "ace"
  | "two"
  | "three"
  | "four"
  | "five"
  | "six"
  | "seven"
  | "eight"
  | "nine"
  | "ten"
  | "page"
  | "knight"
  | "queen"
  | "king";

export type QuestionCategory =
  "general" | "relationship" | "career" | "study" | "finance" | "family";

export type ContentStatus = "draft" | "reviewed";

export interface OrientationMeaning {
  keywords: string[];
  summary: string;
  advice: string;
  caution: string;
  domains: Partial<Record<Exclude<QuestionCategory, "general">, string>>;
}

export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  type: "major" | "minor";
  suit?: Suit;
  rank?: MinorRank;
  illustrationPath: string;
  contentStatus: ContentStatus;
  upright: OrientationMeaning;
  reversed: OrientationMeaning;
}

export type PositionRole =
  | "origin"
  | "current"
  | "goal"
  | "support"
  | "obstacle"
  | "advice"
  | "outcome"
  | "option-benefit"
  | "option-cost";

export type LayoutPattern = "linear" | "hexagram" | "two-paths";

export type LayoutSlot =
  | "left"
  | "center"
  | "right"
  | "top"
  | "upper-right"
  | "lower-right"
  | "bottom"
  | "upper-left"
  | "lower-left"
  | "left-top"
  | "left-bottom"
  | "right-top"
  | "right-bottom";

export interface SpreadPosition {
  index: number;
  label: string;
  description: string;
  role: PositionRole;
  layoutSlot: LayoutSlot;
  option?: "A" | "B";
}

export interface Spread {
  id: "three-card" | "hexagram" | "two-paths";
  name: string;
  shortName: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  layoutPattern: LayoutPattern;
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: SpreadPosition;
}

export type RelationshipKind =
  | "major-concentration"
  | "dominant-suit"
  | "orientation-pattern"
  | "timeline-shift"
  | "core-obstacle"
  | "support-obstacle"
  | "advice-outcome"
  | "two-paths";

export interface PositionReading {
  positionIndex: number;
  positionLabel: string;
  cardId: number;
  cardName: string;
  orientation: "upright" | "reversed";
  keywords: string[];
  text: string;
  reflection: string;
}

export interface RelationshipInsight {
  kind: RelationshipKind;
  relatedPositionIndices: number[];
  text: string;
}

export interface GeneratedReading {
  signature: string;
  theme: string;
  positions: PositionReading[];
  relationships: RelationshipInsight[];
  nextStep: string;
  disclaimer: string;
}

export interface ReadingRequest {
  schemaVersion: 1;
  spreadId: Spread["id"];
  category: QuestionCategory;
  question: string;
  optionA?: string;
  optionB?: string;
}

export interface StoredDraw {
  schemaVersion: 1;
  request: ReadingRequest;
  cards: Array<{ cardId: number; isReversed: boolean; positionIndex: number }>;
  revealedIndices: number[];
}
