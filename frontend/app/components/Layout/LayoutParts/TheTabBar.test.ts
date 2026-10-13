import { mount, RouterLinkStub } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";
import TheTabBar from "./TheTabBar.vue";
import BaseIcon from "~/components/global/BaseIcon.vue";
import type { NavItem } from "~/composables/use-app-nav";

const items: NavItem[] = [
  { key: "recipes", title: "Recipes", icon: "book", to: "/g/home", restricted: false },
  { key: "plan", title: "Plan", icon: "calendar", to: "/household/mealplan/planner/view", restricted: true },
  { key: "shopping", title: "Shopping", icon: "cart", to: "/shopping-lists", restricted: true },
  { key: "cookbooks", title: "Cookbooks", icon: "bookmark", to: "/g/home/cookbooks", restricted: true },
  { key: "more", title: "More", icon: "ellipsis_circle", to: "/more", restricted: false },
];

function mountBar(activePath: string) {
  return mount(TheTabBar, { props: { items, activePath }, global: { stubs: { NuxtLink: RouterLinkStub } } });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TheTabBar", () => {
  test("renders one link per item in order", () => {
    const links = mountBar("/g/home").findAllComponents(RouterLinkStub);
    expect(links.map(l => l.props("to"))).toEqual(items.map(i => i.to));
  });

  test("marks the longest matching tab active with a filled icon", () => {
    const bar = mountBar("/shopping-lists/abc");
    const shopping = bar.find("[data-tab=shopping]");
    expect(shopping.classes()).toContain("is-active");
    expect(shopping.findComponent(BaseIcon).props("filled")).toBe(true);
    expect(bar.find("[data-tab=recipes]").classes()).not.toContain("is-active");
  });

  test("recipes is active for recipe pages under the group", () => {
    expect(mountBar("/g/home/r/pasta").find("[data-tab=recipes]").classes()).toContain("is-active");
    expect(mountBar("/g/home/cookbooks/baking").find("[data-tab=recipes]").classes()).not.toContain("is-active");
  });

  test("tapping the active tab scrolls to the top", async () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    await mountBar("/more").find("[data-tab=more]").trigger("click");
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
