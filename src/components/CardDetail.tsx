import type { DrawnCard } from "@/lib/types";

export function CardDetail({ item }: { item: DrawnCard }) {
  const meaning = item.isReversed ? item.card.reversed : item.card.upright;
  return (
    <>
      <strong>{item.card.name}</strong>
      <small>{item.isReversed ? "逆位" : "正位"}</small>
      <em>{meaning.keywords.slice(0, 2).join(" · ")}</em>
    </>
  );
}
