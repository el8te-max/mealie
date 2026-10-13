import type { ReadCookBook } from "~/lib/api/types/cookbook";
import { useLoggedInState } from "~/composables/use-logged-in-state";
import { useGroupSelf } from "~/composables/use-groups";
import { useCookbookPreferences } from "~/composables/use-users/preferences";
import { useCookbookStore, usePublicCookbookStore } from "~/composables/store/use-cookbook-store";
import { useAnnouncements } from "~/composables/use-announcements";

export type NavAction = "logout" | "login" | "toggle-dark" | "language" | "announcements";

export interface NavItem {
  key: string;
  title: string;
  /** Framework7 icon name */
  icon: string;
  to?: string;
  action?: NavAction;
  restricted: boolean;
  children?: NavItem[];
}

export interface NavSection {
  key: string;
  title: string;
  items: NavItem[];
}

export interface NavContext {
  groupSlug: string;
  loggedIn: boolean;
  isOwnGroup: boolean;
  isAdmin: boolean;
  canManage: boolean;
  userId?: string;
  householdId?: string;
  aiEnabled: boolean;
  announcementsEnabled: boolean;
  hideOtherHouseholds: boolean;
  cookbooks: ReadCookBook[];
  t: (key: string) => string;
}

export interface AppNav {
  tabs: NavItem[];
  sidebar: NavSection[];
  more: NavSection[];
  createMethods: NavItem[];
}

type Maybe<T> = T | false | undefined;

function compact<T>(items: Maybe<T>[]): T[] {
  return items.filter(Boolean) as T[];
}

/** Builds every navigation surface (tab bar, sidebar, More page, add sheet) from one context. */
export function buildAppNav(ctx: NavContext): AppNav {
  const { t } = ctx;
  const g = `/g/${ctx.groupSlug}`;
  const visible = (item: NavItem) => !item.restricted || ctx.isOwnGroup;
  const filterItems = (items: NavItem[]) => items.filter(visible);
  const sections = (list: Maybe<NavSection>[]) =>
    compact(list).map(s => ({ ...s, items: filterItems(s.items) })).filter(s => s.items.length > 0);

  const item = (key: string, title: string, icon: string, to: string, restricted = true): NavItem => ({ key, title, icon, to, restricted });
  const action = (key: NavAction, title: string, icon: string): NavItem => ({ key, title, icon, action: key, restricted: false });

  const recipes = item("recipes", t("general.recipes"), "book", g, false);
  const finder = item("finder", t("recipe-finder.recipe-finder"), "search", `${g}/recipes/finder`, false);
  const favorites = ctx.loggedIn && ctx.userId ? item("favorites", t("general.favorites"), "heart", `/user/${ctx.userId}/favorites`) : undefined;
  const timeline = item("timeline", t("recipe.timeline"), "clock", `${g}/recipes/timeline`);
  const categories = item("categories", t("sidebar.categories"), "square_grid_2x2", `${g}/recipes/categories`);
  const tags = item("tags", t("sidebar.tags"), "tag", `${g}/recipes/tags`);
  const tools = item("tools", t("tool.tools"), "flame", `${g}/recipes/tools`);
  const mealPlan = item("plan", t("meal-plan.meal-planner"), "calendar", "/household/mealplan/planner/view");
  const shopping = item("shopping", t("shopping-list.shopping-lists"), "cart", "/shopping-lists");
  const profile = ctx.loggedIn ? item("profile", t("settings.profile"), "person_crop_circle", "/user/profile") : undefined;
  const household = ctx.loggedIn ? item("household", t("household.household"), "house", "/household") : undefined;
  const dataManagement = ctx.canManage ? item("data", t("data-pages.data-management"), "tray_full", "/group/data") : undefined;
  const migrations = ctx.canManage ? item("migrations", t("settings.migrations"), "arrow_down_doc", "/group/migrations") : undefined;
  const darkMode = action("toggle-dark", t("settings.theme.dark-mode"), "moon");
  const language = action("language", t("sidebar.language"), "globe");
  const announcements = ctx.loggedIn && ctx.announcementsEnabled ? action("announcements", t("announcements.announcements"), "megaphone") : undefined;
  const session = ctx.loggedIn ? action("logout", t("user.logout"), "arrow_right_square") : action("login", t("user.login"), "arrow_left_square");

  const tabs = filterItems([
    recipes,
    { ...mealPlan, title: t("pro.plan") },
    { ...shopping, title: t("pro.shopping") },
    item("cookbooks", t("cookbook.cookbooks"), "bookmark", `${g}/cookbooks`),
    item("more", t("pro.more"), "ellipsis_circle", "/more", false),
  ]);

  const adminItems = [
    item("site-settings", t("settings.site-settings"), "gear_alt", "/admin/site-settings"),
    item("users", t("user.users"), "person_2", "/admin/manage/users"),
    item("groups", t("group.groups"), "person_3", "/admin/manage/groups"),
    item("households", t("household.households"), "house", "/admin/manage/households"),
    item("backups", t("settings.backup-and-exports"), "archivebox", "/admin/backups"),
    item("maintenance", t("sidebar.maintenance"), "wrench", "/admin/maintenance"),
  ];

  const sidebar = sections([
    { key: "library", title: t("pro.library"), items: compact([recipes, finder, favorites, timeline, categories, tags, tools]) },
    { key: "planning", title: t("pro.planning"), items: [mealPlan, shopping] },
    { key: "cookbooks", title: t("cookbook.cookbooks"), items: cookbookItems(ctx, g) },
    {
      key: "settings",
      title: t("general.settings"),
      items: compact([
        profile,
        household,
        dataManagement,
        ctx.isAdmin && item("admin", t("settings.admin-settings"), "wrench", "/admin/site-settings"),
        language,
        darkMode,
        announcements,
        session,
      ]),
    },
  ]);

  const more = sections([
    { key: "library", title: t("pro.library"), items: compact([finder, favorites, timeline, categories, tags, tools]) },
    { key: "account", title: t("pro.account"), items: compact([profile, household, dataManagement, migrations]) },
    ctx.isAdmin && { key: "admin", title: t("settings.admin-settings"), items: adminItems },
    { key: "appearance", title: t("pro.appearance"), items: compact([darkMode, language, announcements]) },
    { key: "session", title: "", items: [session] },
  ]);

  const create = (key: string, title: string, icon: string, path: string) => item(key, title, icon, `${g}/r/create/${path}`);
  const createMethods = filterItems(compact([
    create("url", t("pro.import-url"), "link", "url"),
    create("image", t("pro.import-photo"), "camera", "image"),
    ctx.aiEnabled && create("ai", t("recipe.import-with-ai"), "sparkles", "ai"),
    create("html", t("recipe.import-from-html-or-json"), "chevron_left_slash_chevron_right", "html"),
    create("zip", t("recipe.import-from-zip"), "archivebox", "zip"),
    create("bulk", t("recipe.bulk-url-import"), "square_stack_3d_up", "bulk"),
    create("manual", t("pro.create-manually"), "pencil", "new"),
  ]));

  return { tabs, sidebar, more, createMethods };
}

/** Own household's cookbooks individually (by position); other households grouped and sorted by name. */
function cookbookItems(ctx: NavContext, g: string): NavItem[] {
  const toItem = (cookbook: ReadCookBook): NavItem => ({
    key: cookbook.slug || "",
    title: cookbook.name,
    icon: "bookmark",
    to: `${g}/cookbooks/${cookbook.slug || ""}`,
    restricted: false,
  });

  const sorted = [...ctx.cookbooks].sort((a, b) => (a.position || 0) - (b.position || 0));
  const byHousehold = new Map<string, ReadCookBook[]>();
  for (const cookbook of sorted) {
    const name = cookbook.household?.name || "";
    byHousehold.set(name, [...(byHousehold.get(name) ?? []), cookbook]);
  }

  const own: NavItem[] = [];
  const others: NavItem[] = [];
  for (const [name, cookbooks] of byHousehold) {
    if (cookbooks[0]?.householdId === ctx.householdId) {
      own.push(...cookbooks.map(toItem));
    }
    else {
      others.push({ key: name, title: name, icon: "book", restricted: false, children: cookbooks.map(toItem) });
    }
  }
  others.sort((a, b) => a.title.localeCompare(b.title));

  return ctx.loggedIn && ctx.hideOtherHouseholds ? own : [...own, ...others];
}

/** Reactive navigation for the current user and route. */
export function useAppNav() {
  const i18n = useI18n();
  const auth = useMealieAuth();
  const route = useRoute();
  const { loggedIn, isOwnGroup } = useLoggedInState();
  const { group } = useGroupSelf();
  const cookbookPreferences = useCookbookPreferences();
  const { announcementsEnabled } = useAnnouncements();

  const groupSlug = computed(() => (route.params.groupSlug as string) || auth.user.value?.groupSlug || "");
  const ownCookbookStore = computed(() => (isOwnGroup.value ? useCookbookStore(i18n) : null));
  const publicCookbookStores: Record<string, ReturnType<typeof usePublicCookbookStore>> = {};

  const cookbooks = computed<ReadCookBook[]>(() => {
    if (ownCookbookStore.value) {
      return ownCookbookStore.value.store.value;
    }
    if (groupSlug.value) {
      publicCookbookStores[groupSlug.value] ||= usePublicCookbookStore(groupSlug.value, i18n);
      return unref(publicCookbookStores[groupSlug.value]!.store);
    }
    return [];
  });

  return computed(() => buildAppNav({
    groupSlug: groupSlug.value,
    loggedIn: loggedIn.value,
    isOwnGroup: isOwnGroup.value,
    isAdmin: !!auth.user.value?.admin,
    canManage: !!auth.user.value?.canManage,
    userId: auth.user.value?.id,
    householdId: auth.user.value?.householdId,
    aiEnabled: !!group.value?.aiProviderSettings?.aiEnabled,
    announcementsEnabled: !!announcementsEnabled.value,
    hideOtherHouseholds: cookbookPreferences.value.hideOtherHouseholds,
    cookbooks: cookbooks.value || [],
    t: (key: string) => i18n.t(key),
  }));
}
