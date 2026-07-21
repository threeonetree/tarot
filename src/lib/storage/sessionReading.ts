import type { QuestionCategory, ReadingRequest, StoredDraw } from "@/lib/types";

export const READING_REQUEST_KEY = "tarot-guide:request:v1";
export const READING_DRAW_KEY = "tarot-guide:draw:v1";

const categories: readonly QuestionCategory[] = [
  "general",
  "relationship",
  "career",
  "study",
  "finance",
  "family",
];
const spreadIds = ["three-card", "hexagram", "two-paths"] as const;

export function normalizeText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function parseReadingRequest(raw: string | null): ReadingRequest | undefined {
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as Partial<ReadingRequest>;
    if (
      value.schemaVersion !== 1 ||
      !spreadIds.includes(value.spreadId as (typeof spreadIds)[number]) ||
      !categories.includes(value.category as QuestionCategory) ||
      typeof value.question !== "string"
    ) {
      return undefined;
    }
    return {
      schemaVersion: 1,
      spreadId: value.spreadId as ReadingRequest["spreadId"],
      category: value.category as QuestionCategory,
      question: normalizeText(value.question, 200),
      optionA: typeof value.optionA === "string" ? normalizeText(value.optionA, 40) : undefined,
      optionB: typeof value.optionB === "string" ? normalizeText(value.optionB, 40) : undefined,
    };
  } catch {
    return undefined;
  }
}

export function parseStoredDraw(raw: string | null): StoredDraw | undefined {
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as Partial<StoredDraw>;
    const request = parseReadingRequest(JSON.stringify(value.request));
    if (value.schemaVersion !== 1 || !request || !Array.isArray(value.cards)) return undefined;
    const cards = value.cards.filter(
      (item): item is StoredDraw["cards"][number] =>
        typeof item?.cardId === "number" &&
        Number.isInteger(item.cardId) &&
        typeof item?.isReversed === "boolean" &&
        typeof item?.positionIndex === "number" &&
        Number.isInteger(item.positionIndex),
    );
    if (cards.length !== value.cards.length) return undefined;
    const revealedIndices = Array.isArray(value.revealedIndices)
      ? value.revealedIndices.filter(
          (index): index is number => typeof index === "number" && Number.isInteger(index),
        )
      : [];
    return { schemaVersion: 1, request, cards, revealedIndices: [...new Set(revealedIndices)] };
  } catch {
    return undefined;
  }
}

export function clearReadingSession(storage: Pick<Storage, "removeItem">): void {
  storage.removeItem(READING_REQUEST_KEY);
  storage.removeItem(READING_DRAW_KEY);
}
