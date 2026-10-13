import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import UserTintPicker from "./UserTintPicker.vue";

beforeEach(() => {
  localStorage.clear();
});

describe("UserTintPicker", () => {
  test("offers eight colors with orange selected by default", () => {
    const radios = mount(UserTintPicker).findAll("[role=radio]");
    expect(radios).toHaveLength(8);
    const checked = radios.filter(r => r.attributes("aria-checked") === "true");
    expect(checked.map(r => r.attributes("data-tint"))).toEqual(["orange"]);
  });

  test("selecting a color checks it and persists it", async () => {
    const picker = mount(UserTintPicker);
    await picker.find("[data-tint=blue]").trigger("click");
    expect(picker.find("[data-tint=blue]").attributes("aria-checked")).toBe("true");
    expect(picker.find("[data-tint=orange]").attributes("aria-checked")).toBe("false");
    expect(localStorage.getItem("mealie-pro-tint")).toContain("blue");
  });
});
