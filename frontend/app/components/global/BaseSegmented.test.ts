import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import BaseSegmented from "./BaseSegmented.vue";

const options = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

describe("BaseSegmented", () => {
  test("marks the selected segment", () => {
    const seg = mount(BaseSegmented, { props: { modelValue: "week", options } });
    expect(seg.find("[role=tablist]").exists()).toBe(true);
    const tabs = seg.findAll("[role=tab]");
    expect(tabs[0]!.attributes("aria-selected")).toBe("true");
    expect(tabs[1]!.attributes("aria-selected")).toBe("false");
  });

  test("emits the clicked segment's value", async () => {
    const seg = mount(BaseSegmented, { props: { modelValue: "week", options } });
    await seg.findAll("[role=tab]")[1]!.trigger("click");
    expect(seg.emitted("update:modelValue")).toEqual([["month"]]);
  });
});
