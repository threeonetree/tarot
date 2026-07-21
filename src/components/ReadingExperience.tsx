"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import { CopyButton } from "@/components/CopyButton";
import { TarotCardButton } from "@/components/TarotCardButton";
import { CARDS, REVIEWED_CARD_IDS, getCardById } from "@/lib/data/cards";
import { getSpreadById } from "@/lib/data/spreads";
import { generateReading } from "@/lib/engine/analysis";
import { drawCards } from "@/lib/engine/draw";
import { formatReadingForCopy } from "@/lib/engine/formatReading";
import {
  createInitialReadingState,
  isReadingComplete,
  readingReducer,
} from "@/lib/state/readingReducer";
import {
  READING_DRAW_KEY,
  READING_REQUEST_KEY,
  clearReadingSession,
  parseReadingRequest,
  parseStoredDraw,
} from "@/lib/storage/sessionReading";
import type { DrawnCard, ReadingRequest, StoredDraw } from "@/lib/types";

type LoadState = "loading" | "missing" | "unavailable" | "ready";

function sameRequest(a: ReadingRequest, b: ReadingRequest): boolean {
  return (
    a.spreadId === b.spreadId &&
    a.category === b.category &&
    a.question === b.question &&
    a.optionA === b.optionA &&
    a.optionB === b.optionB
  );
}

function restoreCards(stored: StoredDraw): DrawnCard[] | undefined {
  const spread = getSpreadById(stored.request.spreadId);
  if (!spread || stored.cards.length !== spread.cardCount) return undefined;
  const cards = stored.cards.map((item) => {
    const card = getCardById(item.cardId);
    const position = spread.positions.find((candidate) => candidate.index === item.positionIndex);
    return card && position ? { card, position, isReversed: item.isReversed } : undefined;
  });
  if (cards.some((item) => !item)) return undefined;
  return cards as DrawnCard[];
}

export function ReadingExperience() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [state, dispatch] = useReducer(readingReducer, undefined, createInitialReadingState);
  const pendingStoredDraw = useRef<StoredDraw | undefined>(undefined);
  const storedDrawTimer = useRef<number | undefined>(undefined);

  function flushStoredDraw() {
    if (storedDrawTimer.current !== undefined) {
      window.clearTimeout(storedDrawTimer.current);
      storedDrawTimer.current = undefined;
    }
    if (!pendingStoredDraw.current) return;
    sessionStorage.setItem(READING_DRAW_KEY, JSON.stringify(pendingStoredDraw.current));
    pendingStoredDraw.current = undefined;
  }

  function scheduleStoredDraw(value: StoredDraw) {
    pendingStoredDraw.current = value;
    if (storedDrawTimer.current !== undefined) return;
    storedDrawTimer.current = window.setTimeout(flushStoredDraw, 120);
  }

  useEffect(() => {
    window.addEventListener("pagehide", flushStoredDraw);
    return () => {
      window.removeEventListener("pagehide", flushStoredDraw);
      flushStoredDraw();
    };
  }, []);

  useEffect(() => {
    const initialization = window.setTimeout(() => {
      const activeRequest = parseReadingRequest(sessionStorage.getItem(READING_REQUEST_KEY));
      if (!activeRequest) {
        setLoadState("missing");
        window.location.replace("/select");
        return;
      }
      const spread = getSpreadById(activeRequest.spreadId);
      if (!spread || spread.cardCount > REVIEWED_CARD_IDS.length) {
        setLoadState("unavailable");
        return;
      }
      const stored = parseStoredDraw(sessionStorage.getItem(READING_DRAW_KEY));
      const restored =
        stored && sameRequest(stored.request, activeRequest) ? restoreCards(stored) : undefined;
      if (stored && restored) {
        const lastRevealedIndex = stored.revealedIndices
          .filter((index) => index >= 0 && index < restored.length)
          .at(-1);
        dispatch({
          type: "RESTORE_SESSION",
          state: {
            spread,
            category: activeRequest.category,
            question: activeRequest.question,
            optionA: activeRequest.optionA ?? "",
            optionB: activeRequest.optionB ?? "",
            phase: "revealing",
            drawnCards: restored,
            revealedIndices: new Set(
              stored.revealedIndices.filter((index) => index >= 0 && index < restored.length),
            ),
            activePositionIndex:
              lastRevealedIndex === undefined ? null : restored[lastRevealedIndex].position.index,
          },
        });
        setLoadState("ready");
        return;
      }
      const reviewedDeck = CARDS.filter((card) => card.contentStatus === "reviewed");
      const drawn = drawCards(reviewedDeck, spread.positions);
      const nextStored: StoredDraw = {
        schemaVersion: 1,
        request: activeRequest,
        cards: drawn.map((item) => ({
          cardId: item.card.id,
          isReversed: item.isReversed,
          positionIndex: item.position.index,
        })),
        revealedIndices: [],
      };
      sessionStorage.setItem(READING_DRAW_KEY, JSON.stringify(nextStored));
      dispatch({ type: "SELECT_SPREAD", spread });
      dispatch({
        type: "SET_QUESTION",
        category: activeRequest.category,
        question: activeRequest.question,
        optionA: activeRequest.optionA,
        optionB: activeRequest.optionB,
      });
      dispatch({ type: "START_READING", cards: drawn });
      dispatch({ type: "FINISH_SHUFFLE" });
      setLoadState("ready");
    }, 0);
    return () => window.clearTimeout(initialization);
  }, []);

  const reading = useMemo(() => {
    if (!state.category || !isReadingComplete(state)) return undefined;
    return generateReading(state.drawnCards, state.category);
  }, [state]);

  const request = useMemo<ReadingRequest | undefined>(() => {
    if (!state.spread || !state.category) return undefined;
    return {
      schemaVersion: 1,
      spreadId: state.spread.id,
      category: state.category,
      question: state.question,
      optionA: state.optionA || undefined,
      optionB: state.optionB || undefined,
    };
  }, [state.category, state.optionA, state.optionB, state.question, state.spread]);

  const activeItem = useMemo(
    () => state.drawnCards.find((item) => item.position.index === state.activePositionIndex),
    [state.activePositionIndex, state.drawnCards],
  );

  function reveal(index: number) {
    if (state.revealedIndices.has(index) || !request) return;
    const next = [...state.revealedIndices, index].sort((a, b) => a - b);
    dispatch({ type: "REVEAL_CARD", positionIndex: index });
    const stored = parseStoredDraw(sessionStorage.getItem(READING_DRAW_KEY));
    if (stored && sameRequest(stored.request, request)) {
      scheduleStoredDraw({ ...stored, revealedIndices: next });
    }
  }

  function reset() {
    dispatch({ type: "RESET" });
    clearReadingSession(sessionStorage);
    window.location.assign("/select");
  }

  if (loadState === "loading") {
    return <p className="readingStatus">正在整理牌面…</p>;
  }

  if (loadState === "missing") {
    return (
      <section className="emptyState readingEmpty">
        <span aria-hidden="true">✦</span>
        <h1>还没有准备好的问题</h1>
        <p>请先选择牌阵和问题领域，再开始抽牌。</p>
        <a className="primaryButton" href="/select">
          返回牌阵选择 <span>→</span>
        </a>
      </section>
    );
  }

  if (loadState === "unavailable") {
    return (
      <section className="emptyState readingEmpty">
        <span aria-hidden="true">✦</span>
        <h1>这个牌阵仍在校对</h1>
        <p>当前完成审核的正式牌数量不足以支持这个牌阵，因此不会用草稿牌补位。</p>
        <a className="primaryButton" href="/select">
          选择其他牌阵 <span>→</span>
        </a>
      </section>
    );
  }

  if (!request) return null;
  const spread = state.spread;
  if (!spread) return null;

  return (
    <>
      <section className="readingIntro">
        <p className="kicker">
          <span /> REVEAL THE CARDS <span />
        </p>
        <h1>
          一张一张，
          <br />
          <em>看见问题的不同侧面。</em>
        </h1>
        <div className="readingContext">
          <span>{spread.shortName}</span>
          <span>
            已翻开 {state.revealedIndices.size} / {state.drawnCards.length}
          </span>
          <span>本地随机 · 正逆位</span>
        </div>
        {state.question && <p className="savedQuestion">“{state.question}”</p>}
        {state.optionA && state.optionB && (
          <p className="savedQuestion">
            A：{state.optionA}　/　B：{state.optionB}
          </p>
        )}
      </section>

      {spread.layoutPattern === "two-paths" && state.optionA && state.optionB && (
        <div className="pathLegend" aria-label="二选一牌阵路径说明">
          <span>
            <small>PATH A</small>
            <strong>{state.optionA}</strong>
          </span>
          <span>
            <small>CURRENT</small>
            <strong>当前状态</strong>
          </span>
          <span>
            <small>PATH B</small>
            <strong>{state.optionB}</strong>
          </span>
        </div>
      )}

      <section
        className={`readingLayout ${spread.layoutPattern}`}
        aria-label={`${spread.shortName}牌面`}
      >
        {state.drawnCards.map((item, index) => {
          const revealed = state.revealedIndices.has(index);
          return (
            <TarotCardButton
              key={item.position.index}
              item={item}
              revealed={revealed}
              onReveal={() => reveal(index)}
            />
          );
        })}
      </section>

      {activeItem && (
        <aside className="mobileCardDetail" aria-live="polite" aria-atomic="true">
          <small>{activeItem.position.label}</small>
          <h2>
            {activeItem.card.name} · {activeItem.isReversed ? "逆位" : "正位"}
          </h2>
          <p>
            {(activeItem.isReversed
              ? activeItem.card.reversed
              : activeItem.card.upright
            ).keywords.join(" · ")}
          </p>
          <strong>
            {(activeItem.isReversed ? activeItem.card.reversed : activeItem.card.upright).summary}
          </strong>
        </aside>
      )}

      <p className="revealNotice" aria-live="polite">
        {reading
          ? "所有牌已翻开，综合解读已生成。"
          : "可按任意顺序翻牌；牌面在本次会话中不会重新抽取。"}
      </p>

      {reading && (
        <section className="readingResult">
          <p className="kicker">
            <span /> YOUR READING <span />
          </p>
          <h2>这组牌如何彼此回应</h2>
          <p className="readingTheme">{reading.theme}</p>

          <div className="positionReadings">
            {reading.positions.map((item) => (
              <article key={item.positionIndex}>
                <span>{String(item.positionIndex).padStart(2, "0")}</span>
                <div>
                  <small>{item.positionLabel}</small>
                  <h3>
                    {item.cardName} · {item.orientation === "reversed" ? "逆位" : "正位"}
                  </h3>
                  <p>{item.text}</p>
                  <strong>可以思考：{item.reflection}</strong>
                </div>
              </article>
            ))}
          </div>

          {reading.relationships.length > 0 && (
            <div className="relationshipPanel">
              <h3>牌间关系</h3>
              <ul>
                {reading.relationships.map((item) => (
                  <li key={`${item.kind}-${item.relatedPositionIndices.join("-")}`}>{item.text}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="nextStepPanel">
            <small>NEXT STEP</small>
            <p>{reading.nextStep}</p>
          </div>
          <p className="readingDisclaimer">{reading.disclaimer}</p>
          <div className="resultActions">
            <CopyButton text={formatReadingForCopy(reading, request, spread.name)} />
            <button type="button" className="primaryButton" onClick={reset}>
              重新占卜 <span>↻</span>
            </button>
          </div>
        </section>
      )}
    </>
  );
}
