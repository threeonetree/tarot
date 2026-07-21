import { QUESTION_CATEGORIES } from "@/lib/data/categories";
import type { GeneratedReading, ReadingRequest } from "@/lib/types";

function cleanInline(value: string | undefined): string {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .replace(/([，。！？；：、])\1+/g, "$1")
    .trim();
}

function section(title: string, body: string | string[]): string {
  const lines = (Array.isArray(body) ? body : [body])
    .map((line) => cleanInline(line))
    .filter(Boolean);
  return lines.length ? `${title}\n${lines.join("\n")}` : "";
}

export function formatReadingForCopy(
  reading: GeneratedReading,
  request: ReadingRequest,
  spreadName: string,
): string {
  const category =
    QUESTION_CATEGORIES.find((item) => item.id === request.category)?.name ?? "一般问题";
  const context = [
    "塔罗指引",
    `牌阵：${spreadName}`,
    `领域：${category}`,
    cleanInline(request.question) ? `问题：${cleanInline(request.question)}` : "",
    cleanInline(request.optionA) && cleanInline(request.optionB)
      ? `A：${cleanInline(request.optionA)}\nB：${cleanInline(request.optionB)}`
      : "",
  ].filter(Boolean);
  const positions = reading.positions
    .map((item) => {
      const heading = `${item.positionIndex}. ${cleanInline(item.positionLabel)}｜${cleanInline(item.cardName)}·${item.orientation === "reversed" ? "逆位" : "正位"}`;
      const detail = cleanInline(item.text);
      const reflection = cleanInline(item.reflection);
      return [heading, detail, reflection ? `可以思考：${reflection}` : ""]
        .filter(Boolean)
        .join("\n");
    })
    .filter(Boolean);
  const relationships = [
    ...new Set(reading.relationships.map((item) => cleanInline(item.text)).filter(Boolean)),
  ].map((text) => `- ${text}`);

  return [
    context.join("\n"),
    section("整体主题", reading.theme),
    positions.length ? `位置解读\n${positions.join("\n\n")}` : "",
    section("牌间关系", relationships),
    section("下一步", reading.nextStep),
    cleanInline(reading.disclaimer),
  ]
    .filter(Boolean)
    .join("\n\n");
}
