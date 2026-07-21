import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("public product copy", () => {
  it("does not expose internal reviewed-deck progress to visitors", () => {
    const publicSources = ["src/pages/HomePage.tsx", "src/components/ReadingExperience.tsx"]
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(publicSources).not.toMatch(/9\s*\/\s*78|九张.*(?:样牌|体验版)|审核样牌/);
    expect(publicSources).toContain("本地随机 · 正逆位");
  });
});
