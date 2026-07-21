import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { QuestionForm } from "@/components/QuestionForm";
import { ReadingExperience } from "@/components/ReadingExperience";
import { SPREADS } from "@/lib/data/spreads";
import { READING_REQUEST_KEY } from "@/lib/storage/sessionReading";

describe("question and reading flow", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it("validates the two-path labels before drawing", () => {
    render(<QuestionForm spread={SPREADS[2]} />);
    fireEvent.click(screen.getByRole("radio", { name: /一般问题/ }));
    fireEvent.click(screen.getByRole("button", { name: /开始抽牌/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("需要填写 A、B 两个选项");
  });

  it("locks a valid submission before navigation can be triggered twice", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const removeItem = vi.spyOn(Storage.prototype, "removeItem");
    const navigate = vi.fn();
    render(<QuestionForm spread={SPREADS[0]} onNavigate={navigate} />);
    fireEvent.click(screen.getByRole("radio", { name: /一般问题/ }));
    const button = screen.getByRole("button", { name: /开始抽牌/ });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(screen.getByRole("button", { name: /正在准备牌面/ })).toBeDisabled();
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(removeItem).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("/reading");
    setItem.mockRestore();
    removeItem.mockRestore();
  });

  it("reveals every card and restores the finished reading", async () => {
    sessionStorage.setItem(
      READING_REQUEST_KEY,
      JSON.stringify({
        schemaVersion: 1,
        spreadId: "three-card",
        category: "career",
        question: "下一步该关注什么？",
      }),
    );
    const first = render(<ReadingExperience />);
    await waitFor(() => expect(screen.getAllByRole("button", { name: /翻开/ })).toHaveLength(3));
    for (const button of screen.getAllByRole("button", { name: /翻开/ })) fireEvent.click(button);
    expect(await screen.findByRole("heading", { name: "这组牌如何彼此回应" })).toBeInTheDocument();

    first.unmount();
    render(<ReadingExperience />);
    expect(await screen.findByRole("heading", { name: "这组牌如何彼此回应" })).toBeInTheDocument();
  });

  it("batches rapid reveal persistence and flushes it after a short delay", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    sessionStorage.setItem(
      READING_REQUEST_KEY,
      JSON.stringify({
        schemaVersion: 1,
        spreadId: "three-card",
        category: "general",
        question: "",
      }),
    );
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    render(<ReadingExperience />);
    await waitFor(() => expect(screen.getAllByRole("button", { name: /翻开/ })).toHaveLength(3));
    setItem.mockClear();

    for (const button of screen.getAllByRole("button", { name: /翻开/ })) fireEvent.click(button);
    expect(setItem).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(120);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(setItem.mock.calls[0][1] as string).revealedIndices).toEqual([0, 1, 2]);
    setItem.mockRestore();
    vi.useRealTimers();
  });

  it("enables the seven-card hexagram with the expanded reviewed deck", async () => {
    sessionStorage.setItem(
      READING_REQUEST_KEY,
      JSON.stringify({
        schemaVersion: 1,
        spreadId: "hexagram",
        category: "general",
        question: "",
      }),
    );
    render(<ReadingExperience />);
    await waitFor(() => expect(screen.getAllByRole("button", { name: /翻开/ })).toHaveLength(7));
    expect(screen.queryByText("这个牌阵仍在校对")).not.toBeInTheDocument();
    const [firstCard, ...remainingCards] = screen.getAllByRole("button", { name: /翻开/ });
    fireEvent.click(firstCard);
    expect(screen.getByRole("complementary")).toHaveTextContent(/正位|逆位/);
    for (const button of remainingCards) fireEvent.click(button);
    expect(
      await screen.findByText("把核心状态与阻碍放在一起看，可以区分问题本身和阻碍问题推进的条件。"),
    ).toBeInTheDocument();
  });

  it("completes the two-paths comparison without selecting a winner", async () => {
    sessionStorage.setItem(
      READING_REQUEST_KEY,
      JSON.stringify({
        schemaVersion: 1,
        spreadId: "two-paths",
        category: "career",
        question: "如何比较两个选择？",
        optionA: "接受新机会",
        optionB: "留在当前岗位",
      }),
    );
    render(<ReadingExperience />);
    await waitFor(() => expect(screen.getAllByRole("button", { name: /翻开/ })).toHaveLength(5));
    expect(screen.getByLabelText("二选一牌阵路径说明")).toHaveTextContent(
      "PATH A接受新机会CURRENT当前状态PATH B留在当前岗位",
    );
    for (const button of screen.getAllByRole("button", { name: /翻开/ })) fireEvent.click(button);
    expect(
      await screen.findByText(
        "两条路径各自包含优势与代价；牌面用于帮助你比较取舍，不替你决定哪一条必然更好。",
      ),
    ).toBeInTheDocument();
  });
});
