"use client";

import { useRef, useState, type FormEvent } from "react";

import { QUESTION_CATEGORIES } from "@/lib/data/categories";
import { READING_DRAW_KEY, READING_REQUEST_KEY, normalizeText } from "@/lib/storage/sessionReading";
import type { QuestionCategory, ReadingRequest, Spread } from "@/lib/types";

interface QuestionFormProps {
  spread: Spread;
  onNavigate?: (path: string) => void;
}

export function QuestionForm({
  spread,
  onNavigate = (path) => window.location.assign(path),
}: QuestionFormProps) {
  const [category, setCategory] = useState<QuestionCategory | "">("");
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;
    if (!category) {
      setError("请先选择一个问题领域。");
      return;
    }
    const normalizedA = normalizeText(optionA, 40);
    const normalizedB = normalizeText(optionB, 40);
    if (spread.id === "two-paths" && (!normalizedA || !normalizedB)) {
      setError("抉择之路需要填写 A、B 两个选项。");
      return;
    }
    if (spread.id === "two-paths" && normalizedA === normalizedB) {
      setError("A、B 两个选项不能完全相同。");
      return;
    }
    const request: ReadingRequest = {
      schemaVersion: 1,
      spreadId: spread.id,
      category,
      question: normalizeText(question, 200),
      optionA: normalizedA || undefined,
      optionB: normalizedB || undefined,
    };
    submitLock.current = true;
    setIsSubmitting(true);
    sessionStorage.setItem(READING_REQUEST_KEY, JSON.stringify(request));
    sessionStorage.removeItem(READING_DRAW_KEY);
    onNavigate("/reading");
  }

  return (
    <form className="questionForm" onSubmit={submit}>
      <fieldset>
        <legend>
          选择问题领域 <small>必选</small>
        </legend>
        <div className="categoryGrid">
          {QUESTION_CATEGORIES.map((item) => (
            <label key={item.id}>
              <input
                type="radio"
                name="category"
                value={item.id}
                checked={category === item.id}
                onChange={() => {
                  setCategory(item.id);
                  setError("");
                }}
              />
              <span>
                <strong>{item.name}</strong>
                <small>{item.description}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {spread.id === "two-paths" && (
        <fieldset className="optionFields">
          <legend>
            写下两条路径 <small>必填 · 每项最多 40 字</small>
          </legend>
          <div>
            <label>
              <span>A</span>
              <input
                value={optionA}
                maxLength={40}
                onChange={(event) => setOptionA(event.target.value)}
                placeholder="例如：接受新的工作机会"
              />
            </label>
            <label>
              <span>B</span>
              <input
                value={optionB}
                maxLength={40}
                onChange={(event) => setOptionB(event.target.value)}
                placeholder="例如：留在目前的岗位"
              />
            </label>
          </div>
        </fieldset>
      )}

      <label className="questionInput">
        <span>
          你的具体问题 <small>可选 · 最多 200 字</small>
        </span>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={200}
          placeholder="例如：面对这个新的工作机会，我最需要关注什么？"
        />
      </label>
      {error && (
        <p className="formError" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="primaryButton"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? "正在准备牌面…" : "开始抽牌"} <span>{isSubmitting ? "✦" : "→"}</span>
      </button>
    </form>
  );
}
