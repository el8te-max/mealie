import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import BaseIcon from "./BaseIcon.vue";
import { F7_FALLBACKS, F7_NO_FILL } from "~/lib/icons/f7-fallbacks";

describe("BaseIcon", () => {
  test("renders a Framework7 ligature hidden from assistive tech", () => {
    const icon = mount(BaseIcon, { props: { name: "house" } }).find("i");
    expect(icon.text()).toBe("house");
    expect(icon.classes()).toContain("f7-icons");
    expect(icon.attributes("aria-hidden")).toBe("true");
  });

  test("appends _fill when filled", () => {
    expect(mount(BaseIcon, { props: { name: "house", filled: true } }).text()).toBe("house_fill");
  });

  test("applies the size as font-size", () => {
    const icon = mount(BaseIcon, { props: { name: "house", size: 30 } }).find("i");
    expect(icon.attributes("style")).toContain("font-size: 30px");
  });

  test("uses the Phosphor fallback for names Framework7 lacks", () => {
    const [name, fallback] = Object.entries(F7_FALLBACKS)[0]!;
    const icon = mount(BaseIcon, { props: { name } }).find("i");
    expect(icon.classes()).toContain("ph");
    expect(icon.classes()).toContain(`ph-${fallback}`);
    expect(icon.text()).toBe("");
  });

  test("ignores filled for glyphs without a fill variant", () => {
    const name = [...F7_NO_FILL][0]!;
    expect(mount(BaseIcon, { props: { name, filled: true } }).text()).toBe(name);
  });
});
