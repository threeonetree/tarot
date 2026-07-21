import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const cssPath = resolve(process.cwd(), "src/styles/global.css");
const css = readFileSync(cssPath, "utf8");

function cssToken(name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Missing CSS token --${name}`);
  return match[1];
}

function luminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground: string, background: string): number {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

describe("accessible color tokens", () => {
  it("keeps primary, secondary and gold text above WCAG AA on dark surfaces", () => {
    for (const backgroundToken of ["ink", "ink-soft"]) {
      for (const token of ["cream", "muted", "muted-readable", "gold", "gold-bright"]) {
        expect(
          contrast(cssToken(token), cssToken(backgroundToken)),
          `${token} on ${backgroundToken}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("keeps focus and control gold above the 3:1 non-text threshold", () => {
    expect(contrast(cssToken("gold"), cssToken("ink"))).toBeGreaterThanOrEqual(3);
  });
});
