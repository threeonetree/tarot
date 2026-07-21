export function CardBack({ label }: { label: string }) {
  return (
    <span className="readingCardBack">
      <span aria-hidden="true">✦</span>
      <strong>{label}</strong>
      <small>点击翻牌</small>
    </span>
  );
}
