"use client";

import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "success" | "error";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand?.("copy") ?? false;
  textarea.remove();
  if (!copied) throw new Error("clipboard unavailable");
}

export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  async function copy() {
    try {
      await copyToClipboard(text);
      setState("success");
    } catch {
      setState("error");
    }
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setState("idle"), 2600);
  }

  const label =
    state === "success" ? "已复制解读" : state === "error" ? "复制失败，请重试" : "复制解读";
  return (
    <div className="copyReading">
      <button type="button" className="secondaryButton" onClick={copy}>
        {label} <span>{state === "success" ? "✓" : "⧉"}</span>
      </button>
      <p>复制只会写入系统剪贴板；粘贴到第三方应用后，内容将离开当前浏览器的隐私边界。</p>
      <span className="srOnly" aria-live="polite">
        {state === "success" ? "解读已复制到剪贴板" : state === "error" ? "复制失败" : ""}
      </span>
    </div>
  );
}
