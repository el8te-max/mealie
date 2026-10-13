import { mount, RouterLinkStub } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import BaseListRow from "./BaseListRow.vue";
import BaseIcon from "./BaseIcon.vue";

const global = { stubs: { NuxtLink: RouterLinkStub } };

describe("BaseListRow", () => {
  test("renders a link with a chevron when given a route", () => {
    const row = mount(BaseListRow, { props: { title: "More", to: "/more" }, global });
    expect(row.findComponent(RouterLinkStub).props("to")).toBe("/more");
    expect(row.find(".base-list-row__chevron").exists()).toBe(true);
  });

  test("emits click when it has no route", async () => {
    const row = mount(BaseListRow, { props: { title: "Log Out" }, global });
    await row.find(".base-list-row").trigger("click");
    expect(row.emitted("click")).toHaveLength(1);
  });

  test("toggle accessory emits the flipped value", async () => {
    const row = mount(BaseListRow, { props: { title: "Dark Mode", accessory: "toggle", modelValue: false }, global });
    await row.find("[role=switch]").trigger("click");
    expect(row.emitted("update:modelValue")).toEqual([[true]]);
  });

  test("shows the value text and the icon tile", () => {
    const row = mount(BaseListRow, { props: { title: "Language", value: "On", icon: "gear" }, global });
    expect(row.text()).toContain("On");
    expect(row.findComponent(BaseIcon).props("name")).toBe("gear");
  });
});
