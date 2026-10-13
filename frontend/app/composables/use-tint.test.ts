import { beforeEach, describe, expect, test } from "vitest";
import { applyTint, resolveTint, TINTS, useTint } from "./use-tint";

describe("resolveTint", () => {
  test("accepts a known tint key", () => {
    expect(resolveTint("blue")).toBe("blue");
  });

  test("falls back to orange for unknown or non-string values", () => {
    expect(resolveTint("neon")).toBe("orange");
    expect(resolveTint(null)).toBe("orange");
    expect(resolveTint(42)).toBe("orange");
  });

  test("rejects inherited object keys", () => {
    expect(resolveTint("constructor")).toBe("orange");
    expect(resolveTint("__proto__")).toBe("orange");
    expect(resolveTint("toString")).toBe("orange");
  });
});

describe("useTint", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("defaults to orange with empty storage", () => {
    expect(useTint().tint.value).toBe("orange");
  });

  test("persists the chosen tint across instances", () => {
    useTint().setTint("green");
    expect(useTint().tint.value).toBe("green");
    expect(localStorage.getItem("mealie-pro-tint")).toContain("green");
  });

  test("falls back to orange when storage holds garbage", () => {
    localStorage.setItem("mealie-pro-tint", "not-json{");
    expect(useTint().tint.value).toBe("orange");
  });

  test("offers all eight iOS tints", () => {
    expect(useTint().tintOptions).toEqual(Object.keys(TINTS));
    expect(useTint().tintOptions).toHaveLength(8);
  });
});

describe("applyTint", () => {
  test("sets light and dark tint CSS variables on the root element", () => {
    applyTint("blue");
    const style = document.documentElement.style;
    expect(style.getPropertyValue("--pro-tint-light")).toBe("#007AFF");
    expect(style.getPropertyValue("--pro-tint-dark")).toBe("#0A84FF");
  });
});
