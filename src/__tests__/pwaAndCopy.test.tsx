import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import { CopyButton } from "@/components/CopyButton";
import { PwaStatus } from "@/components/PwaStatus";
import { formatReadingForCopy } from "@/lib/engine/formatReading";
import type { GeneratedReading, ReadingRequest } from "@/lib/types";

const reading: GeneratedReading = {
  signature: "general|1:0:0",
  theme: "整体主题",
  positions: [
    {
      positionIndex: 1,
      positionLabel: "现在",
      cardId: 0,
      cardName: "愚者",
      orientation: "upright",
      keywords: ["开始"],
      text: "位置解释",
      reflection: "行动建议",
    },
  ],
  relationships: [{ kind: "orientation-pattern", relatedPositionIndices: [1], text: "关系解释" }],
  nextStep: "下一步建议",
  disclaimer: "边界说明",
};

const request: ReadingRequest = {
  schemaVersion: 1,
  spreadId: "three-card",
  category: "career",
  question: "是否接受新机会？",
};

describe("PWA and copy output", () => {
  it("exposes an installable standalone manifest", () => {
    const value = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));
    expect(value.display).toBe("standalone");
    expect(value.start_url).toBe("/");
    expect(value.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: "192x192" }),
        expect.objectContaining({ sizes: "512x512", purpose: "any maskable" }),
      ]),
    );
  });

  it("precaches all routes and the complete local deck for offline readings", () => {
    const source = readFileSync("public/sw.js", "utf8");
    expect(source).toContain("Array.from({ length: 22 }");
    expect(source).toContain('"cups", "swords", "wands", "pentacles"');
    expect(source).toContain('"page",');
    expect(source).toContain('"king",');
    expect(source).toContain('"/question/three-card"');
    expect(source).toContain('"/question/hexagram"');
    expect(source).toContain('"/question/two-paths"');
    expect(source).toContain('"/reading"');
    expect(source).toContain('caches.match("/")');
  });

  it("offers an installed update without refreshing until the user chooses", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const postMessage = vi.fn();
    const waitingWorker = { postMessage } as unknown as ServiceWorker;
    const registration = new EventTarget() as ServiceWorkerRegistration;
    Object.defineProperties(registration, {
      waiting: { configurable: true, value: waitingWorker },
      installing: { configurable: true, value: null },
    });
    const serviceWorker = new EventTarget() as ServiceWorkerContainer;
    Object.defineProperties(serviceWorker, {
      controller: { configurable: true, value: {} },
      register: { configurable: true, value: vi.fn().mockResolvedValue(registration) },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: serviceWorker,
    });

    render(<PwaStatus />);
    expect(await screen.findByText(/新版本已准备好/)).toBeInTheDocument();
    expect(postMessage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "刷新更新" }));
    expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
    vi.unstubAllEnvs();
  });

  it("formats a complete reading without empty or undefined sections", () => {
    const text = formatReadingForCopy(reading, request, "三张牌 · 时间之箭");
    expect(text).toContain("领域：事业工作");
    expect(text).toContain("问题：是否接受新机会？");
    expect(text).toContain("1. 现在｜愚者·正位");
    expect(text).toContain("牌间关系");
    expect(text).not.toMatch(/undefined|null/);
  });

  it("omits empty optional content and normalizes noisy punctuation", () => {
    const noisyReading: GeneratedReading = {
      ...reading,
      theme: "  整体主题。。  ",
      positions: [{ ...reading.positions[0], reflection: "   " }],
      relationships: [{ ...reading.relationships[0], text: "   " }],
      nextStep: "下一步建议！！",
    };
    const text = formatReadingForCopy(
      noisyReading,
      { ...request, question: "   ", optionA: "只有 A", optionB: "   " },
      "三张牌 · 时间之箭",
    );

    expect(text).not.toContain("问题：");
    expect(text).not.toContain("A：");
    expect(text).not.toContain("可以思考：");
    expect(text).not.toContain("牌间关系");
    expect(text).not.toMatch(/undefined|null|。。|！！/);
  });

  it("removes repeated relationship lines from copied output", () => {
    const duplicated: GeneratedReading = {
      ...reading,
      relationships: [reading.relationships[0], { ...reading.relationships[0] }],
    };
    const text = formatReadingForCopy(duplicated, request, "三张牌 · 时间之箭");

    expect(text.match(/- 关系解释/g)).toHaveLength(1);
  });

  it("copies only after the user activates the copy button", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<CopyButton text="本地解读" />);
    expect(writeText).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /复制解读/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("本地解读"));
    expect(screen.getByRole("button", { name: /已复制解读/ })).toBeInTheDocument();
    expect(screen.getByText(/离开当前浏览器的隐私边界/)).toBeInTheDocument();
  });

  it("reports a clipboard failure and then returns to the idle state", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<CopyButton text="本地解读" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /复制解读/ }));
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: /复制失败，请重试/ })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2600));
    expect(screen.getByRole("button", { name: /复制解读/ })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
