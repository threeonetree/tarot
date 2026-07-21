import { CardBack } from "@/components/CardBack";
import { CardFace } from "@/components/CardFace";
import type { DrawnCard } from "@/lib/types";

interface TarotCardButtonProps {
  item: DrawnCard;
  revealed: boolean;
  onReveal: () => void;
}

export function TarotCardButton({ item, revealed, onReveal }: TarotCardButtonProps) {
  return (
    <button
      type="button"
      className={`readingCard ${revealed ? "isRevealed" : ""}`}
      style={{ gridArea: item.position.layoutSlot }}
      onClick={onReveal}
      disabled={revealed}
      aria-label={
        revealed
          ? `${item.position.label}：${item.card.name}${item.isReversed ? "逆位" : "正位"}`
          : `翻开${item.position.label}`
      }
    >
      {revealed ? <CardFace item={item} /> : <CardBack label={item.position.label} />}
    </button>
  );
}
