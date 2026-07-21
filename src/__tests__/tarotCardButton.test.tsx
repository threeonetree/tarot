import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TarotCardButton } from "@/components/TarotCardButton";
import { CARDS } from "@/lib/data/cards";
import { SPREADS } from "@/lib/data/spreads";
import type { DrawnCard } from "@/lib/types";

const item: DrawnCard = {
  card: CARDS[2],
  position: SPREADS[0].positions[0],
  isReversed: true,
};

describe("TarotCardButton", () => {
  it("uses a real button and delegates an unrevealed card click", () => {
    const onReveal = vi.fn();
    render(<TarotCardButton item={item} revealed={false} onReveal={onReveal} />);
    const button = screen.getByRole("button", { name: "翻开过去" });
    expect(button).toHaveAttribute("type", "button");
    fireEvent.click(button);
    expect(onReveal).toHaveBeenCalledTimes(1);
  });

  it("disables a revealed card while keeping reversed text upright", () => {
    const { container } = render(
      <TarotCardButton item={item} revealed={true} onReveal={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: "过去：女祭司逆位" })).toBeDisabled();
    expect(screen.getByText("逆位")).toBeInTheDocument();
    expect(container.querySelector(".readingArt")).toHaveClass("reversedArt");
    expect(screen.getByText("封闭 · 忽视直觉")).toBeInTheDocument();
  });
});
