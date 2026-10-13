import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { nextTick } from "vue";
import BaseLargeTitle from "./BaseLargeTitle.vue";

let fireIntersection: (isIntersecting: boolean) => void;

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
      fireIntersection = isIntersecting => callback([{ isIntersecting }]);
    }

    observe() {}
    disconnect() {}
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BaseLargeTitle", () => {
  test("renders the title as a large-title heading and the trailing slot", () => {
    const wrapper = mount(BaseLargeTitle, {
      props: { title: "Recipes" },
      slots: { trailing: "<button class='add'>+</button>" },
    });
    const heading = wrapper.find("h1.pro-large-title");
    expect(heading.text()).toBe("Recipes");
    expect(wrapper.find(".add").exists()).toBe(true);
  });

  test("collapses into the inline bar when the sentinel scrolls away", async () => {
    const wrapper = mount(BaseLargeTitle, { props: { title: "Recipes" } });
    const bar = () => wrapper.find(".base-large-title__bar");

    fireIntersection(false);
    await nextTick();
    expect((wrapper.vm as unknown as { collapsed: boolean }).collapsed).toBe(true);
    expect(bar().classes()).toContain("is-visible");

    fireIntersection(true);
    await nextTick();
    expect(bar().classes()).not.toContain("is-visible");
  });
});
