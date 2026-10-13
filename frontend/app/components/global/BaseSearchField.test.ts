import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import BaseSearchField from "./BaseSearchField.vue";

describe("BaseSearchField", () => {
  test("emits typed text", async () => {
    const field = mount(BaseSearchField, { props: { modelValue: "" } });
    await field.find("input").setValue("pasta");
    expect(field.emitted("update:modelValue")?.at(-1)).toEqual(["pasta"]);
  });

  test("emits submit on Enter", async () => {
    const field = mount(BaseSearchField, { props: { modelValue: "pasta" } });
    await field.find("input").trigger("keydown", { key: "Enter" });
    expect(field.emitted("submit")).toHaveLength(1);
  });

  test("shows Cancel on focus, which clears the field", async () => {
    const field = mount(BaseSearchField, { props: { modelValue: "pasta" } });
    expect(field.find(".base-search-field__cancel").exists()).toBe(false);
    await field.find("input").trigger("focus");
    const cancel = field.find(".base-search-field__cancel");
    expect(cancel.text()).toBe("Cancel");
    await cancel.trigger("click");
    expect(field.emitted("update:modelValue")?.at(-1)).toEqual([""]);
  });
});
