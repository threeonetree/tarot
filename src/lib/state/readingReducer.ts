import { normalizeText } from "@/lib/storage/sessionReading";
import type { DrawnCard, QuestionCategory, Spread } from "@/lib/types";

export type ReadingPhase = "idle" | "shuffling" | "revealing";

export interface ReadingState {
  spread: Spread | null;
  category: QuestionCategory | null;
  question: string;
  optionA: string;
  optionB: string;
  phase: ReadingPhase;
  drawnCards: DrawnCard[];
  revealedIndices: Set<number>;
  activePositionIndex: number | null;
}

export type ReadingAction =
  | { type: "SELECT_SPREAD"; spread: Spread }
  | {
      type: "SET_QUESTION";
      category: QuestionCategory;
      question: string;
      optionA?: string;
      optionB?: string;
    }
  | { type: "START_READING"; cards: DrawnCard[] }
  | { type: "FINISH_SHUFFLE" }
  | { type: "REVEAL_CARD"; positionIndex: number }
  | { type: "SET_ACTIVE_CARD"; positionIndex: number }
  | { type: "RESTORE_SESSION"; state: ReadingState }
  | { type: "RESET" };

export function createInitialReadingState(): ReadingState {
  return {
    spread: null,
    category: null,
    question: "",
    optionA: "",
    optionB: "",
    phase: "idle",
    drawnCards: [],
    revealedIndices: new Set<number>(),
    activePositionIndex: null,
  };
}

export function isReadingComplete(state: ReadingState): boolean {
  return state.drawnCards.length > 0 && state.revealedIndices.size === state.drawnCards.length;
}

export function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  switch (action.type) {
    case "SELECT_SPREAD":
      return { ...createInitialReadingState(), spread: action.spread };

    case "SET_QUESTION":
      return {
        ...state,
        category: action.category,
        question: normalizeText(action.question, 200),
        optionA: normalizeText(action.optionA ?? "", 40),
        optionB: normalizeText(action.optionB ?? "", 40),
      };

    case "START_READING":
      if (!state.spread || action.cards.length !== state.spread.cardCount) {
        throw new Error(
          "START_READING requires one complete generated draw for the selected spread.",
        );
      }
      return {
        ...state,
        phase: "shuffling",
        drawnCards: [...action.cards],
        revealedIndices: new Set<number>(),
        activePositionIndex: null,
      };

    case "FINISH_SHUFFLE":
      return state.phase === "shuffling" ? { ...state, phase: "revealing" } : state;

    case "REVEAL_CARD": {
      if (
        state.phase !== "revealing" ||
        action.positionIndex < 0 ||
        action.positionIndex >= state.drawnCards.length ||
        state.revealedIndices.has(action.positionIndex)
      ) {
        return state;
      }
      const revealedIndices = new Set(state.revealedIndices);
      revealedIndices.add(action.positionIndex);
      return {
        ...state,
        revealedIndices,
        activePositionIndex: state.drawnCards[action.positionIndex].position.index,
      };
    }

    case "SET_ACTIVE_CARD":
      return state.drawnCards.some((item) => item.position.index === action.positionIndex)
        ? { ...state, activePositionIndex: action.positionIndex }
        : state;

    case "RESTORE_SESSION":
      return {
        ...action.state,
        drawnCards: [...action.state.drawnCards],
        revealedIndices: new Set(action.state.revealedIndices),
      };

    case "RESET":
      return createInitialReadingState();
  }
}
