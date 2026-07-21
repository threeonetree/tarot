import { CardDetail } from "@/components/CardDetail";
import type { DrawnCard } from "@/lib/types";

export function CardFace({ item }: { item: DrawnCard }) {
  return (
    <span className="readingCardFace">
      <span className={`readingArt ${item.isReversed ? "reversedArt" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.card.illustrationPath} alt="" />
      </span>
      <CardDetail item={item} />
    </span>
  );
}
