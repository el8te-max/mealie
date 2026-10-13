import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";
import BaseSheet from "./BaseSheet.vue";

function mountSheet(modelValue: boolean) {
  return mount(BaseSheet, {
    props: { modelValue, title: "Add Recipe" },
    slots: { default: "<p class='content'>Pick a method</p>" },
    attachTo: document.body,
  });
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("BaseSheet", () => {
  test("renders nothing while closed", () => {
    mountSheet(false);
    expect(document.body.querySelector("[role=dialog]")).toBeNull();
  });

  test("renders a labelled modal dialog with its content when open", () => {
    mountSheet(true);
    const dialog = document.body.querySelector("[role=dialog]")!;
    expect(dialog.getAttribute("aria-label")).toBe("Add Recipe");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.querySelector(".content")?.textContent).toBe("Pick a method");
  });

  test("closes on backdrop click", async () => {
    const wrapper = mountSheet(true);
    (document.body.querySelector(".base-sheet__backdrop") as HTMLElement).click();
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
  });

  test("closes on Escape", async () => {
    const wrapper = mountSheet(true);
    document.body.querySelector("[role=dialog]")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
  });
});
