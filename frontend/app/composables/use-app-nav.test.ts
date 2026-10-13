import { describe, expect, test } from "vitest";
import { buildAppNav, type NavContext, type NavItem } from "./use-app-nav";
import type { ReadCookBook } from "~/lib/api/types/cookbook";

function cookbook(slug: string, position: number, householdId: string, householdName: string): ReadCookBook {
  return { slug, name: slug, position, householdId, household: { name: householdName } } as unknown as ReadCookBook;
}

function ctx(overrides: Partial<NavContext> = {}): NavContext {
  return {
    groupSlug: "home",
    loggedIn: true,
    isOwnGroup: true,
    isAdmin: false,
    canManage: false,
    userId: "u1",
    householdId: "h1",
    aiEnabled: false,
    announcementsEnabled: false,
    hideOtherHouseholds: false,
    cookbooks: [],
    t: (key: string) => key,
    ...overrides,
  };
}

function allItems(nav: ReturnType<typeof buildAppNav>): NavItem[] {
  const flatten = (items: NavItem[]): NavItem[] => items.flatMap(i => [i, ...flatten(i.children ?? [])]);
  return flatten([
    ...nav.tabs,
    ...nav.sidebar.flatMap(s => s.items),
    ...nav.more.flatMap(g => g.items),
  ]);
}

describe("buildAppNav", () => {
  test("member gets the five tabs in order", () => {
    const nav = buildAppNav(ctx());
    expect(nav.tabs.map(t => t.key)).toEqual(["recipes", "plan", "shopping", "cookbooks", "more"]);
    expect(nav.tabs[0]!.to).toBe("/g/home");
  });

  test("visitor only sees public navigation", () => {
    const nav = buildAppNav(ctx({ loggedIn: false, isOwnGroup: false, userId: undefined }));
    expect(nav.tabs.map(t => t.key)).toEqual(["recipes", "more"]);
    expect(nav.createMethods).toEqual([]);
    expect(nav.sidebar.find(s => s.key === "planning")).toBeUndefined();
    expect(nav.more.at(-1)!.items.some(i => i.action === "login")).toBe(true);
    expect(allItems(nav).some(i => i.action === "logout")).toBe(false);
  });

  test("admin items only for admins", () => {
    const hasAdmin = (nav: ReturnType<typeof buildAppNav>) => ({
      more: nav.more.some(g => g.key === "admin"),
      sidebar: allItems({ ...nav, more: [] }).some(i => i.to === "/admin/site-settings"),
    });
    expect(hasAdmin(buildAppNav(ctx()))).toEqual({ more: false, sidebar: false });
    expect(hasAdmin(buildAppNav(ctx({ isAdmin: true })))).toEqual({ more: true, sidebar: true });
  });

  test("data management and migrations only for managers", () => {
    const keys = (c: NavContext) => allItems(buildAppNav(c)).map(i => i.to);
    expect(keys(ctx())).not.toContain("/group/data");
    expect(keys(ctx())).not.toContain("/group/migrations");
    expect(keys(ctx({ canManage: true }))).toContain("/group/data");
    expect(keys(ctx({ canManage: true }))).toContain("/group/migrations");
  });

  test("AI import only when AI is enabled", () => {
    expect(buildAppNav(ctx()).createMethods.map(m => m.key)).not.toContain("ai");
    const methods = buildAppNav(ctx({ aiEnabled: true })).createMethods;
    expect(methods.map(m => m.key)).toContain("ai");
    expect(methods).toHaveLength(7);
    expect(methods.find(m => m.key === "url")!.to).toBe("/g/home/r/create/url");
  });

  test("cookbooks: own listed by position, other households grouped unless hidden", () => {
    const cookbooks = [
      cookbook("baking", 2, "h1", "Mine"),
      cookbook("weeknight", 1, "h1", "Mine"),
      cookbook("theirs", 1, "h2", "Neighbors"),
    ];
    const section = (c: NavContext) => buildAppNav(c).sidebar.find(s => s.key === "cookbooks")!.items;

    const items = section(ctx({ cookbooks }));
    expect(items.map(i => i.key)).toEqual(["weeknight", "baking", "Neighbors"]);
    expect(items[0]!.to).toBe("/g/home/cookbooks/weeknight");
    expect(items[2]!.children!.map(c => c.key)).toEqual(["theirs"]);

    expect(section(ctx({ cookbooks, hideOtherHouseholds: true })).map(i => i.key)).toEqual(["weeknight", "baking"]);
  });

  test("everything the old header and sidebar offered stays reachable", () => {
    const items = allItems(buildAppNav(ctx({ announcementsEnabled: true })));
    const routes = items.map(i => i.to);
    for (const route of [
      "/g/home/recipes/finder",
      "/user/u1/favorites",
      "/g/home/recipes/timeline",
      "/g/home/recipes/categories",
      "/g/home/recipes/tags",
      "/g/home/recipes/tools",
      "/user/profile",
      "/household",
    ]) {
      expect(routes).toContain(route);
    }
    const actions = items.map(i => i.action);
    for (const action of ["logout", "toggle-dark", "language", "announcements"]) {
      expect(actions).toContain(action);
    }
  });
});
