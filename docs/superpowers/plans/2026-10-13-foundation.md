# Mealie Pro Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every Mealie page an Apple-HIG look: iOS tokens and typography, Framework7 icons, restyled core components, a phone tab bar / desktop sidebar shell, a More page, and an add-recipe sheet.

**Architecture:** Keep Vuetify 4 and re-skin it through global defaults, CSS tokens, and SCSS overrides. New Apple-style primitives (`Base*`) are plain Vue + scoped CSS with no Vuetify dependency, so they are easy to test and look native. Navigation data lives in one pure builder (`buildAppNav`) consumed by the tab bar, sidebar, and More page.

**Tech Stack:** Nuxt 4, Vue 3, Vuetify 4, TypeScript, VueUse, Vitest + @vue/test-utils (jsdom), `framework7-icons`, `@phosphor-icons/web`, pnpm 11.23.0, uv.

**Spec:** `docs/superpowers/specs/2026-10-13-foundation-design.md`

## Global Constraints

- Only files under `frontend/` change (plus this plan's checkboxes). Never edit `mealie/`, `frontend/app/lib/api/types/`, or any locale file other than `frontend/app/lang/messages/en-US.json`.
- No route/URL changes.
- Component naming per `AGENTS.md`: shared primitives `components/global/Base*`, singleton layout parts `components/Layout/LayoutParts/The*`.
- Tokens: tint default orange `#FF9500` light / `#FF9F0A` dark; radii 10 / 14 / 20px; spacing 4, 8, 12, 16, 20, 32px; ease `cubic-bezier(.32,.72,0,1)`; durations 200 / 350ms; min row/tap height 44px; phone breakpoint `< 768px`.
- Font stack: `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, system-ui, sans-serif`. Do not bundle SF Pro or SF Symbols.
- Icons bundled from npm, never a CDN.
- New user-facing strings go in `en-US.json` under a new `"pro"` key; reuse existing keys where one fits.
- Every animation is disabled under `prefers-reduced-motion: reduce`.
- Commits: conventional commit messages, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Repo-local git identity is already set.
- Run frontend commands from `frontend/`. Unit tests: `pnpm vitest run <path>`. Lint: `pnpm lint`.

## Review Focus

1. **Logged-out / other-group visitor** viewing `/g/{slug}` (public recipes): tabs and sidebar items marked restricted must be hidden, exactly as the old sidebar hid `restricted` links when `!isOwnGroup`. Test in Task 8.
2. **Things only the old header/sidebar offered** (logout, login, language, dark-mode toggle, announcements, user favorites, recipe finder) must still be reachable from More or the sidebar. Test in Task 8.
3. **Admin vs non-admin vs canManage**: Admin rows only for `user.admin`; Data Management only for `user.canManage`. Test in Task 8.
4. **Many cookbooks / other-household cookbooks**: sidebar must list own cookbooks individually and group other households' cookbooks, respecting `cookbookPreferences.hideOtherHouseholds` like the old `cookbookLinks`. Test in Task 8.
5. **Corrupt tint value in localStorage** (e.g. `"neon"` or non-JSON) must fall back to orange without throwing. Test in Task 2.

---

### Task 0: Dev environment baseline

**Files:** none (read-only setup). Record working commands in `.claude/CLAUDE.md` under `## Commands`.

- [ ] **Step 1:** Install pnpm 11.23.0 (`npm i -g pnpm@11.23.0`; Node 26 has no corepack). Run `pnpm install` in `frontend/`.
- [ ] **Step 2:** Run `uv sync --group dev` at repo root (SQLite only; skip `--extra pgsql`).
- [ ] **Step 3:** Read the `py` and `ui` targets in `Taskfile.yml`; start the backend (port 9000) and frontend (`pnpm dev`, port 3000) with the raw commands they wrap, both in background. Expected: `http://localhost:3000` shows the Mealie login page.
- [ ] **Step 4:** Log in with the default admin from Mealie's docs/seed (`changeme@example.com`). Expected: recipes home renders.
- [ ] **Step 5:** Baseline: `pnpm lint` and `pnpm vitest run`. Expected: both pass. Record any pre-existing failures in `.claude/CLAUDE.md`; they are not this plan's to fix.
- [ ] **Step 6:** Write the exact start/test commands into `.claude/CLAUDE.md` `## Commands`; commit `chore: document local dev commands`.

---

### Task 1: Design tokens, Vuetify defaults, overrides, PWA meta

**Files:**
- Create: `frontend/app/assets/pro/tokens.scss`, `frontend/app/assets/pro/vuetify-overrides.scss`
- Modify: `frontend/nuxt.config.ts` (`css` array line ~75, `app.head.meta` line ~47, `vuetify.vuetifyOptions.defaults` line ~255)

**Interfaces:**
- Produces CSS custom properties used by every later task: `--pro-label`, `--pro-label-secondary`, `--pro-label-tertiary`, `--pro-separator`, `--pro-bg`, `--pro-bg-grouped`, `--pro-bg-elevated`, `--pro-fill`, `--pro-fill-secondary`, `--pro-tint`, `--pro-space-1..6`, `--pro-radius-control|card|sheet`, `--pro-material-thin|regular|thick`, `--pro-blur`, `--pro-ease-spring`, `--pro-dur-fast` (200ms), `--pro-dur` (350ms). Text-style classes `pro-large-title`, `pro-title1..3`, `pro-headline`, `pro-body`, `pro-callout`, `pro-subhead`, `pro-footnote`, `pro-caption` (sizes per spec §1).

- [ ] **Step 1:** Write `tokens.scss`: light values on `:root`, dark values on `.v-theme--dark` (iOS system colors). `--pro-tint: #FF9500` default (light) / `#FF9F0A` (dark). Set `body`/`.v-application` font-family to the global font stack. Add `@supports not (backdrop-filter: blur(1px))` swapping materials to `--pro-bg-elevated`, and a reduced-motion block zeroing both durations.
- [ ] **Step 2:** Write `vuetify-overrides.scss`: no ripples (`.v-ripple__container{display:none}`), no elevation shadows, `VSwitch` as iOS switch (51×31 track, tint when on), round checkboxes, pill chips, list items min-height 44px, inputs on `--pro-fill` with control radius.
- [ ] **Step 3:** In `nuxt.config.ts`: append both files to `css`; add `defaults` entries (keep the existing `scrollStrategy` ones): `global: { ripple: false }`, `VBtn: { elevation: 0, rounded: "lg" }`, `VCard: { elevation: 0, rounded: "xl", flat: true }`, `VTextField|VSelect|VAutocomplete|VCombobox|VTextarea: { variant: "solo-filled", flat: true, rounded: "lg" }`, `VList: { bgColor: "transparent" }`, `VSheet: { elevation: 0 }`.
- [ ] **Step 4:** Head meta: change viewport to `width=device-width, initial-scale=1, viewport-fit=cover`; add `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style=black-translucent`, and two `theme-color` metas (`#F2F2F7` with `media="(prefers-color-scheme: light)"`, `#000000` dark).
- [ ] **Step 5:** Verify: `pnpm lint` passes; reload `localhost:3000` in the browser pane at 375px and desktop, light and dark: system font, flat buttons, filled inputs, no ripples. Existing pages still render.
- [ ] **Step 6:** Commit `feat(ui): add iOS design tokens and Vuetify re-skin`.

---

### Task 2: Tint preference

**Files:**
- Create: `frontend/app/composables/use-tint.ts`, `frontend/app/composables/use-tint.test.ts`
- Modify: `frontend/app/plugins/theme.ts`

**Interfaces:**
- Produces:
  - `type TintKey = "orange" | "red" | "pink" | "purple" | "indigo" | "blue" | "teal" | "green"`
  - `const TINTS: Record<TintKey, { light: string; dark: string }>` = orange `#FF9500/#FF9F0A`, red `#FF3B30/#FF453A`, pink `#FF2D55/#FF375F`, purple `#AF52DE/#BF5AF2`, indigo `#5856D6/#5E5CE6`, blue `#007AFF/#0A84FF`, teal `#30B0C7/#40C8E0`, green `#34C759/#30D158`
  - `function resolveTint(raw: unknown): TintKey` (pure; invalid → `"orange"`)
  - `function useTint(): { tint: Ref<TintKey>; tintOptions: TintKey[]; setTint(key: TintKey): void }`, storage key `mealie-pro-tint`
  - `function applyTint(key: TintKey, theme?: VuetifyThemeInstance): void` sets `--pro-tint` on `document.documentElement` for the current mode and `primary` on Vuetify's light and dark themes

- [ ] **Step 1: Failing tests** in `use-tint.test.ts`:
  - `resolveTint("blue")` → `"blue"`; `resolveTint("neon")`, `resolveTint(null)`, `resolveTint(42)` → `"orange"`.
  - With empty localStorage, `useTint().tint.value` → `"orange"`.
  - `setTint("green")` then a fresh `useTint()` → `"green"`, and `localStorage.getItem("mealie-pro-tint")` contains `green`.
  - localStorage holding `not-json{` → `useTint().tint.value === "orange"` with no throw.
  - `applyTint("blue")` → `document.documentElement.style.getPropertyValue("--pro-tint") === "#007AFF"`.
- [ ] **Step 2:** `pnpm vitest run app/composables/use-tint.test.ts` → FAIL (module missing).
- [ ] **Step 3:** Implement with `useLocalStorage<string>("mealie-pro-tint", "orange", { serializer: StorageSerializers.string })`, exposing a computed `tint` through `resolveTint`; wrap storage access in try/catch.
- [ ] **Step 4:** Tests PASS.
- [ ] **Step 5:** In `plugins/theme.ts`, after building `vuetifyOptions.theme`, set `themes.light.colors.primary` / `themes.dark.colors.primary` from `TINTS[resolveTint(localStorage value)]` (guard `import.meta.client`). Add a `nuxtApp.hook("app:mounted")` that calls `applyTint` and watches `tint` + dark mode to re-apply.
- [ ] **Step 6:** Verify in the browser pane: `localStorage.setItem("mealie-pro-tint","green")` + reload → primary buttons green. Commit `feat(ui): add per-device accent tint`.

---

### Task 3: Icons

**Files:**
- Create: `frontend/app/components/global/BaseIcon.vue`, `frontend/app/components/global/BaseIcon.test.ts`, `frontend/app/lib/icons/f7-fallbacks.ts`, `frontend/app/lib/icons/mdi-to-f7.ts`
- Modify: `frontend/package.json` (via `pnpm add framework7-icons @phosphor-icons/web`), `frontend/nuxt.config.ts` (`css`: add `framework7-icons/css/framework7-icons.css`, `@phosphor-icons/web/regular/style.css`, `@phosphor-icons/web/fill/style.css`)

**Interfaces:**
- Produces:
  - `<BaseIcon name: string, filled?: boolean = false, size?: number = 22 />` renders `<i class="f7-icons" aria-hidden="true">{name}{filled ? "_fill" : ""}</i>` with `font-size: {size}px`; if `name` is a key in `F7_FALLBACKS`, renders `<i class="ph ph-{fallback}">` (or `ph-fill`) instead.
  - `F7_FALLBACKS: Record<string, string>` (Framework7 name → Phosphor name) for names Framework7 lacks; `F7_NO_FILL: Set<string>` for glyphs with no `_fill` variant (filled ignored).
  - `mdiToF7(mdiKey: keyof typeof $globals.icons): string | undefined` and `MDI_TO_F7` table covering every icon used by DefaultLayout, AppSidebar, AppHeader, and the create links (e.g. `silverwareForkKnife→book`, `calendarMultiselect→calendar`, `formatListCheck→cart`, `book→bookmark`, `timelineText→clock`, `tags→tag`, `categories→square_grid_2x2`, `potSteam→flame`, `cog→gear_alt`, `wrench→wrench`, `manageData→tray_full`, `search→search`, `link→link`, `autoFix→sparkles`, `edit→pencil`, `createAlt→plus_circle`).

- [ ] **Step 1: Failing tests** in `BaseIcon.test.ts`:
  - `name="house"` → text `house`, class `f7-icons`, `aria-hidden="true"`.
  - `name="house" filled` → text `house_fill`.
  - `size=30` → style `font-size: 30px`.
  - a name present in `F7_FALLBACKS` → element has class `ph` and `ph-<fallback>`.
  - a name in `F7_NO_FILL` with `filled` → no `_fill` suffix.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement the component and both lib files.
- [ ] **Step 4:** Run → PASS. `pnpm lint` passes.
- [ ] **Step 5:** Commit `feat(ui): add Framework7 icon component and mdi mapping`.

---

### Task 4: Grouped list and segmented control

**Files:**
- Create: `frontend/app/components/global/BaseListGroup.vue`, `BaseListRow.vue`, `BaseSegmented.vue`, and `BaseListRow.test.ts`, `BaseSegmented.test.ts` (same folder)

**Interfaces:**
- Consumes: `BaseIcon` (Task 3).
- Produces:
  - `<BaseListGroup header?: string footer?: string>` default slot of rows; inset card (`--pro-bg-elevated`, card radius, 16px side margin).
  - `<BaseListRow title: string, subtitle?: string, value?: string, icon?: string, iconColor?: string, to?: string, accessory?: "chevron" | "toggle" | "check" | "none" = to ? "chevron" : "none", modelValue?: boolean>`; emits `click`, `update:modelValue` (toggle). Renders `NuxtLink` when `to` is set, else `<button>` (or `<div>` when `accessory="toggle"`). Icon tile 30×30, radius 7, white glyph on `iconColor`. Min height 44px. Inset separator from the text start.
  - `<BaseSegmented modelValue, options: { value: string | number; label: string }[]>` emits `update:modelValue`; `role="tablist"`, segments `role="tab"` with `aria-selected`.

- [ ] **Step 1: Failing tests** (stub `NuxtLink` with `RouterLinkStub`):
  - Row with `to="/more"` renders the link stub with `to` `/more` and a chevron.
  - Row without `to` emits `click` on click.
  - Row `accessory="toggle"` `modelValue=false`: clicking the switch emits `update:modelValue` with `true`.
  - Row `value="On"` shows the text `On`; `icon="gear"` renders `BaseIcon` with `name="gear"`.
  - Segmented with 2 options and `modelValue="week"`: the week segment has `aria-selected="true"`; clicking the other emits its value.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS, lint passes.
- [ ] **Step 5:** Commit `feat(ui): add iOS grouped list and segmented control`.

---

### Task 5: Bottom sheet

**Files:**
- Create: `frontend/app/components/global/BaseSheet.vue`, `BaseSheet.test.ts`

**Interfaces:**
- Produces: `<BaseSheet v-model: boolean, title?: string, detent?: "medium" | "large" = "medium">` default slot. Phone (`useMediaQuery("(max-width: 767px)")`): fixed bottom sheet, grab handle, dimmed backdrop, swipe down > 100px or velocity > 0.5px/ms closes. Desktop: centered modal, max-width 540px, sheet radius. `Escape` and backdrop click close. Teleported to `body`. Focus moves into the sheet on open and returns on close. `role="dialog"`, `aria-modal="true"`, `aria-label=title`.

- [ ] **Step 1: Failing tests** (`attachTo: document.body`):
  - `modelValue=false` → no `[role=dialog]` in `document.body`.
  - `modelValue=true, title="Add Recipe"` → dialog present with `aria-label="Add Recipe"` and slot content.
  - Clicking `.base-sheet__backdrop` emits `update:modelValue` `false`.
  - Keydown `Escape` on the dialog emits `update:modelValue` `false`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement (pointer events for swipe; `Transition` using `--pro-ease-spring` / `--pro-dur`). **Step 4:** PASS, lint.
- [ ] **Step 5:** Commit `feat(ui): add iOS bottom sheet`.

---

### Task 6: Large title and search field

**Files:**
- Create: `frontend/app/components/global/BaseLargeTitle.vue`, `BaseLargeTitle.test.ts`, `BaseSearchField.vue`, `BaseSearchField.test.ts`
- Modify: `frontend/app/components/global/BasePageTitle.vue` (render through `BaseLargeTitle`, keeping its current props and slots)

**Interfaces:**
- Consumes: `BaseIcon`.
- Produces:
  - `<BaseLargeTitle title: string>` slots `leading`, `trailing`, `bottom`. A zero-height sentinel sits below the 34pt title; an `IntersectionObserver` sets `collapsed` when the sentinel leaves the viewport, showing a sticky 44px inline bar (17pt semibold centered title, `--pro-material-regular` + `--pro-blur`, hairline bottom border). Exposes `collapsed` via `defineExpose`.
  - `<BaseSearchField v-model: string, placeholder?: string>` rounded `--pro-fill` input with magnifier; on focus shows a Cancel button (existing `general.cancel` key) that clears and blurs; emits `update:modelValue`, `submit` on Enter.

- [ ] **Step 1: Failing tests:**
  - LargeTitle renders the title text in an `h1.pro-large-title`; `trailing` slot content renders.
  - With a mocked `IntersectionObserver` (capture the callback), firing `isIntersecting: false` → `wrapper.vm.collapsed === true` and the inline bar has class `is-visible`; `true` → hidden again.
  - SearchField typing `pasta` emits `update:modelValue` `pasta`; Enter emits `submit`; focusing shows Cancel; clicking Cancel emits `update:modelValue` `""`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement; then switch `BasePageTitle` to wrap `BaseLargeTitle`, mapping its existing title slot/props. **Step 4:** PASS; `pnpm vitest run` (full) still passes; lint.
- [ ] **Step 5:** Browser check: a page using `BasePageTitle` (e.g. `/group/data`) shows a large title that collapses on scroll. Commit `feat(ui): add large title and search field`.

---

### Task 7: Restyle existing global components

**Files:**
- Modify: `frontend/app/components/global/BaseButton.vue`, `BaseDialog.vue`, `BaseMenu.vue`, `ContextMenu.vue`, `CrudTable.vue`, `frontend/app/components/Layout/LayoutParts/TheSnackbar.vue`

**Interfaces:** no prop, slot, or event changes. Style and markup classes only.

- [ ] **Step 1:** `BaseButton`: map existing variants to iOS styles. Primary actions (create, save, update) filled tint; secondary (edit, download) tinted (tint at 15% alpha background, tint text); cancel and delete plain text (delete in error color). Press feedback `transform: scale(.97); opacity: .7` over `--pro-dur-fast`.
- [ ] **Step 2:** `BaseDialog`: sheet radius, `--pro-bg-grouped` body, header as 17pt semibold centered title, action buttons as plain tint text in a hairline-separated footer.
- [ ] **Step 3:** `BaseMenu` / `ContextMenu`: menu surface `--pro-material-thick` + `--pro-blur`, radius 14, rows 44px with hairline separators, icons on the trailing side.
- [ ] **Step 4:** `CrudTable`: below 768px render rows as `BaseListGroup`/`BaseListRow` (title = first column, value = second, chevron opens the existing edit action); at 768px and above keep `v-data-table` with borders removed and an iOS header style.
- [ ] **Step 5:** `TheSnackbar`: top-center pill (radius 999, `--pro-material-thick` + blur), slides down with `--pro-ease-spring`, keeps the existing message/color store.
- [ ] **Step 6:** Verify: `pnpm vitest run` and `pnpm lint` pass. In the browser pane check `/group/data/foods` (CrudTable, dialogs, buttons) at 375px and desktop, light and dark, and trigger a snackbar by saving something. Commit `feat(ui): restyle core global components`.

---

### Task 8: Navigation model

**Files:**
- Create: `frontend/app/composables/use-app-nav.ts`, `frontend/app/composables/use-app-nav.test.ts`
- Modify: `frontend/app/lang/messages/en-US.json` (add `pro.more`, `pro.library`, `pro.planning`, `pro.account`, `pro.appearance`, `pro.accent-color`, `pro.add-recipe`, `pro.plan`, `pro.shopping`)

**Interfaces:**
- Produces:
  - `interface NavItem { key: string; title: string; icon: string /* Framework7 name */; to?: string; action?: "logout" | "login" | "toggle-dark" | "language" | "announcements"; restricted: boolean; children?: NavItem[] }`
  - `interface NavContext { groupSlug: string; loggedIn: boolean; isOwnGroup: boolean; isAdmin: boolean; canManage: boolean; userId?: string; householdId?: string; aiEnabled: boolean; announcementsEnabled: boolean; hideOtherHouseholds: boolean; cookbooks: ReadCookBook[]; t: (key: string) => string }`
  - `function buildAppNav(ctx: NavContext): { tabs: NavItem[]; sidebar: { key: string; title: string; items: NavItem[] }[]; more: { key: string; title: string; items: NavItem[] }[]; createMethods: NavItem[] }`. Pure, with restricted items already filtered out when `!ctx.isOwnGroup`.
  - `function useAppNav(): ComputedRef<ReturnType<typeof buildAppNav>>` gathers the context from `useMealieAuth`, `useLoggedInState`, `useGroupSelf`, `useRoute`, the cookbook stores, and `useCookbookPreferences`, moving the logic out of `DefaultLayout.vue` lines 80–190 unchanged in behavior.
- Content (routes copied from the current `DefaultLayout.vue` and `AppSidebar.vue`):
  - `tabs`: recipes `/g/{slug}` (`book`), plan `/household/mealplan/planner/view` (`calendar`, restricted), shopping `/shopping-lists` (`cart`, restricted), cookbooks `/g/{slug}/cookbooks` (`bookmark`, restricted), more `/more` (`ellipsis_circle`).
  - `sidebar`: Library (Recipes, Recipe Finder `/g/{slug}/recipes/finder`, Favorites `/user/{userId}/favorites` when logged in, Timeline, Categories, Tags, Tools), Planning (Meal Plan, Shopping Lists), Cookbooks (own cookbooks individually sorted by `position`; other households grouped as one item with `children`, omitted when `hideOtherHouseholds`), Settings (Profile `/user/profile`, Household `/household`, Data Management `/group/data` if `canManage`, Admin `/admin/site-settings` if `isAdmin`, Language, Dark Mode, Announcements if enabled, Log Out or Log In).
  - `more`: Library (Recipe Finder, Favorites, Timeline, Categories, Tags, Tools), Account (Profile, Household, Data Management if `canManage`, Migrations `/group/migrations` if `canManage`), Admin if `isAdmin` (Site Settings, Users `/admin/manage/users`, Groups `/admin/manage/groups`, Households `/admin/manage/households`, Backups `/admin/backups`, Maintenance `/admin/maintenance`), Appearance (Accent Color, Dark Mode, Language, Announcements if enabled), and a final group with Log Out (or Log In when logged out).
  - `createMethods` (all restricted): URL `r/create/url`, Photo `r/create/image`, AI `r/create/ai` (only if `aiEnabled`), HTML `r/create/html`, ZIP `r/create/zip`, Bulk `r/create/bulk`, Manual `r/create/new`, all under `/g/{slug}/`.

- [ ] **Step 1: Failing tests** for `buildAppNav` with a base context (logged in, own group, non-admin):
  - `tabs.map(t => t.key)` equals `["recipes","plan","shopping","cookbooks","more"]`; recipes `to === "/g/home"`.
  - Visitor context (`loggedIn:false, isOwnGroup:false`) → tabs are only `recipes` and `more`; `createMethods` is empty; the sidebar has no Planning section; More's last group contains a `login` action.
  - Non-admin → no `admin` group in `more` and no admin item in the sidebar; `isAdmin:true` → both present.
  - `canManage:false` → no Data Management or Migrations items; `true` → present.
  - `aiEnabled:false` → no `ai` in `createMethods`; `true` → present, 7 methods total.
  - Cookbooks: two own cookbooks with positions 2 and 1 → Cookbooks section lists them position-ordered as individual items; one cookbook from another household → grouped item with `children`; `hideOtherHouseholds:true` → the group is absent.
  - Reachability: the union of every `to` across tabs, sidebar, and more includes `/g/home/recipes/finder`, `/user/u1/favorites`, `/g/home/recipes/timeline`, `/g/home/recipes/tools`, `/user/profile`, `/household`, and an item with `action: "logout"` exists.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement `buildAppNav`, then `useAppNav`. **Step 4:** PASS, lint.
- [ ] **Step 5:** Commit `feat(ui): add shared navigation model`.

---

### Task 9: Tab bar and sidebar

**Files:**
- Create: `frontend/app/components/Layout/LayoutParts/TheTabBar.vue`, `TheTabBar.test.ts`, `TheSidebar.vue`

**Interfaces:**
- Consumes: `NavItem` (Task 8), `BaseIcon`.
- Produces:
  - `<TheTabBar items: NavItem[], activePath: string>`. Fixed bottom, height `49px + env(safe-area-inset-bottom)`, `--pro-material-regular` + blur, hairline top. Active item = longest `to` that prefixes `activePath` (recipes `/g/{slug}` is active only when no other tab matches). Active shows a filled icon and tint color; tapping the active tab calls `window.scrollTo({ top: 0, behavior: "smooth" })`.
  - `<TheSidebar sections, v-model:collapsed: boolean>`. 260px translucent column (`--pro-material-thin` + blur), section headers as uppercase footnote text, rows 32px with tint icons, active row on `--pro-fill`. Items with `children` expand inline. Action items emit `action` with the action name.

- [ ] **Step 1: Failing tests** for `TheTabBar` (stub NuxtLink):
  - Renders 5 links for 5 items, in order.
  - `activePath="/shopping-lists/abc"` → the shopping item has class `is-active` and a `BaseIcon` with `filled`; recipes is not active.
  - `activePath="/g/home/r/pasta"` → recipes active.
  - Clicking the already-active tab calls a mocked `window.scrollTo` with `{ top: 0, behavior: "smooth" }`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement both components. **Step 4:** PASS, lint.
- [ ] **Step 5:** Commit `feat(ui): add tab bar and sidebar`.

---

### Task 10: New default layout, add-recipe sheet, transitions

**Files:**
- Create: `frontend/app/components/Domain/Recipe/RecipeAddSheet.vue`
- Modify: `frontend/app/components/Layout/DefaultLayout.vue` (full rewrite), `frontend/app/pages/g/[groupSlug]/index.vue` (add the `+` trigger), `frontend/nuxt.config.ts` (`app.pageTransition`)
- Delete from usage (keep the files until Sub-project 5): `AppHeader`, `AppSidebar` are no longer referenced by `DefaultLayout`.

**Interfaces:**
- Consumes: `useAppNav`, `TheTabBar`, `TheSidebar`, `BaseSheet`, `BaseListGroup`, `BaseListRow`, `useToggleDarkMode`, the existing logout from `useMealieAuth`, `LanguageDialog`.
- Produces: `<RecipeAddSheet v-model: boolean>` lists `nav.createMethods` as `BaseListRow`s and closes on selection. A layout-level handler `handleNavAction(action)` covering `logout`, `login` (navigate `/login`), `toggle-dark`, `language` (open `LanguageDialog`), and `announcements` (open the existing announcements dialog the old sidebar used).

- [ ] **Step 1:** Rewrite `DefaultLayout.vue`: `<v-app>` → `TheSnackbar`; `TheSidebar` when `display.width >= 768`; `<v-main>` with bottom padding `calc(49px + env(safe-area-inset-bottom))` on phone; `TheTabBar` on phone; keep the existing `AppFooter`/`AppScrollToTop`/announcement logic the old layout rendered. Remove the old `createLinks`/`topLinks`/`cookbookLinks` code (now in `use-app-nav`).
- [ ] **Step 2:** Create `RecipeAddSheet.vue`; on `pages/g/[groupSlug]/index.vue` add a trailing `+` (`plus_circle_fill`, `aria-label` = `pro.add-recipe`) shown only when `isOwnGroup`, opening the sheet.
- [ ] **Step 3:** Page transitions: `app.pageTransition = { name: "pro-page", mode: "out-in" }`; in `tokens.scss` define `.pro-page-*` as a 24px horizontal slide plus fade on `max-width: 767px` and a fade only above that, both 0ms under reduced motion.
- [ ] **Step 4:** Verify: `pnpm vitest run` and `pnpm lint` pass. Browser pane at 375px: tab bar shows, tabs navigate, `+` opens the sheet, each method opens its create page. At desktop width: sidebar shows with cookbooks, Settings actions work (dark mode toggles, language dialog opens, log out works, then log back in). Logged out on `/g/home`: only Recipes and More tabs.
- [ ] **Step 5:** Commit `feat(ui): new app shell with tab bar, sidebar, and add sheet`.

---

### Task 11: More page with tint picker

**Files:**
- Create: `frontend/app/pages/more.vue`, `frontend/app/components/Domain/User/UserTintPicker.vue`, `UserTintPicker.test.ts`

**Interfaces:**
- Consumes: `useAppNav().more`, `useTint`, `BaseLargeTitle`, `BaseListGroup`, `BaseListRow`, `handleNavAction` behavior (same actions as Task 10; extract that handler into `frontend/app/composables/use-nav-actions.ts` here and make `DefaultLayout` import it too).
- Produces: `<UserTintPicker>` with eight 28px dots (`role="radiogroup"`, each `role="radio"`, `aria-checked`, `aria-label` = color name) calling `setTint`.

- [ ] **Step 1: Failing test** for `UserTintPicker`: renders 8 radios; the orange one is `aria-checked="true"` by default; clicking blue makes blue checked and `localStorage` holds `blue`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement the picker, `use-nav-actions.ts`, and `more.vue` (large title "More", one `BaseListGroup` per `more` group, Accent Color row containing `UserTintPicker`, Dark Mode row as a toggle). **Step 4:** PASS, lint.
- [ ] **Step 5:** Browser check at 375px, light and dark: More lists every group for an admin, tint change recolors the tab bar and buttons live. Commit `feat(ui): add More page and tint picker`.

---

### Task 12: Verification pass

**Files:** none unless fixes are needed.

- [ ] **Step 1:** `pnpm vitest run` and `pnpm lint` → pass.
- [ ] **Step 2: Reachability:** for each page under `frontend/app/pages/` that the old layout linked to (the routes in Task 8 plus every admin page), open it through the new navigation as admin at 375px and at desktop width. Confirm it renders without console errors (`read_console_messages`, errors only).
- [ ] **Step 3: Visitor check:** log out, open `/g/home`: recipes visible, only Recipes and More tabs, More shows Log In.
- [ ] **Step 4: Visual sweep:** light and dark at both widths for the recipes home, a recipe page, meal planner, shopping list, `/group/data/foods`, `/admin/site-settings`, `/login`. Fix any unreadable contrast or broken layout caused by tokens or defaults (page-internal redesign stays out of scope).
- [ ] **Step 5:** `git diff --stat v3.28.0 -- mealie/` → empty. Commit any fixes as `fix(ui): ...`.
