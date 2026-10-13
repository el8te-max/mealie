# Mealie Pro — Sub-project 1: Foundation Design

Date: 2026-10-13
Branch: `pro` (based on upstream tag `v3.28.0`)

## Context

Mealie Pro is a personal fork of the Mealie recipe manager for one household, deployed as a Docker container on an Unraid home server. The goal is a full visual redesign that follows Apple's Human Interface Guidelines ("rich, seamless feel") on both phone and desktop. Every existing feature stays; only the look and feel change.

The redesign is split into five sub-projects, each with its own spec, plan, and implementation:

1. **Foundation** (this document): tokens, theme, icons, core components, app shell, navigation.
2. Recipes: browse, search, view, cook mode, create/import.
3. Meal planner.
4. Shopping lists.
5. Secondary screens: profile, household, group data, admin, auth pages.

A small deploy step (GitHub Actions workflow that builds and pushes `ghcr.io/el8te-max/mealie` for linux/amd64) follows Foundation.

## Constraints

- All changes live in `frontend/`. The backend (`mealie/`) is not modified, so upstream backend and security fixes keep merging cleanly and the database stays compatible with stock Mealie.
- No Docker on the development Mac. Development uses Node (pnpm) for the frontend and `uv` for the backend, with SQLite.
- Keep Vuetify 4. The redesign is a deep re-skin of Vuetify plus a small set of new Apple-style components, not a component-library replacement.
- Follow upstream's frontend conventions in `AGENTS.md`: shared primitives in `components/global/` with a `Base` prefix, singleton layout parts with a `The` prefix, composables for shared logic, only `en-US` locale strings added.
- No URL changes. All existing routes keep working.
- SF Symbols and SF Pro are not bundled (Apple's license limits them to Apple-platform apps and mockups). The system font stack renders SF Pro natively on Apple devices; Framework7 Icons provide the SF-Symbols look.

## Success criteria

- Every page renders inside the new shell with the new tokens, typography, icons, and restyled core components.
- Phone (< 768px): bottom tab bar navigation. iPad/desktop (≥ 768px): translucent sidebar.
- Every page that was reachable from the old sidebar is reachable from the new tab bar, More page, or sidebar.
- Light and dark mode both follow the system setting; the existing manual toggle still works.
- The user can pick an accent tint; the choice persists per device.
- `task ui:check` equivalent (frontend lint and Vitest) passes.

## 1. Design tokens and theming

**File:** `frontend/app/assets/pro/tokens.scss`, imported from `nuxt.config.ts` `css` after the existing stylesheets.

Defines CSS custom properties, with a light set on `:root` and a dark set applied under `.v-theme--dark` (Vuetify's dark class) so both the system setting and the manual toggle work:

- **Colors:** iOS system semantic colors: `--pro-label`, `--pro-label-secondary`, `--pro-label-tertiary`, `--pro-separator`, `--pro-bg`, `--pro-bg-grouped`, `--pro-bg-elevated`, `--pro-fill`, `--pro-fill-secondary`. Values match iOS light/dark system colors.
- **Tint:** `--pro-tint`, set at runtime from the tint preference (see below). Eight options, each with light and dark values: orange (`#FF9500` / `#FF9F0A`, default), red, pink, purple, indigo, blue, teal, green.
- **Typography:** font family `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, system-ui, sans-serif`. Utility classes for the iOS text styles: `pro-large-title` (34/41 bold), `pro-title1` (28), `pro-title2` (22), `pro-title3` (20), `pro-headline` (17 semibold), `pro-body` (17), `pro-callout` (16), `pro-subhead` (15), `pro-footnote` (13), `pro-caption` (12).
- **Spacing:** `--pro-space-1..6` = 4, 8, 12, 16, 20, 32px. Standard horizontal margin is 16px.
- **Radius:** `--pro-radius-control` 10px, `--pro-radius-card` 14px, `--pro-radius-sheet` 20px.
- **Materials:** `--pro-material-thin|regular|thick` (background color with alpha) plus `--pro-blur` (`blur(20px) saturate(180%)`). A `@supports not (backdrop-filter: blur(1px))` block swaps materials for solid `--pro-bg-elevated`.
- **Motion:** `--pro-ease-spring: cubic-bezier(.32,.72,0,1)`, durations 200/350ms. A `prefers-reduced-motion: reduce` block sets durations to 0.

**Vuetify wiring:**

- `frontend/app/plugins/theme.ts`: after the server theme loads, override `primary` in both light and dark themes with the current tint value. Other server colors (success, error, etc.) are kept.
- `nuxt.config.ts` `vuetify.vuetifyOptions.defaults`: global defaults so every component picks up the new look without page edits: `elevation: 0`, `flat` surfaces, `rounded` mapped to the token radii, `VBtn` with no ripple and iOS heights, `VTextField`/`VSelect`/`VAutocomplete` with `variant: "solo-filled"`, flat, rounded, `VCard` flat with card radius, `VList` with no dividers by default.
- `frontend/app/assets/pro/vuetify-overrides.scss`: CSS-level overrides Vuetify defaults cannot express: iOS switch styling for `VSwitch`, checkbox circles, chip pill shape, list row heights (44px minimum), removal of Material ripples and elevation shadows.

**Tint preference:**

- New composable `frontend/app/composables/use-tint.ts` exposing `tint` (reactive key, e.g. `"orange"`), `tintOptions`, and `setTint(key)`.
- Stored with VueUse `useLocalStorage` under key `mealie-pro-tint`, following the pattern in `composables/use-users/preferences.ts`. An invalid or missing value falls back to `"orange"`. If storage throws, the in-memory default is used.
- On change, it updates `--pro-tint` on `document.documentElement` and Vuetify's `primary` color for both themes.

**Icons:**

- Add `framework7-icons` and `@phosphor-icons/web` as npm dependencies, bundled locally (no CDN), so the app works offline on the home server.
- New `frontend/app/components/global/BaseIcon.vue`: props `name` (Framework7 name), `filled` (boolean, appends `_fill` when the variant exists), `size` (default 22). Falls back to a Phosphor icon via a small name map when the Framework7 glyph is missing; logs a warning in dev mode if neither exists.
- New `frontend/app/lib/icons/mdi-to-f7.ts`: mapping table from the Material Design Icons used today (`$globals.icons.*`) to Framework7 names. Foundation uses it in the shell and core components; pages switch over during their own sub-projects.

## 2. Core components

**New global components (`frontend/app/components/global/`):**

| Component | Purpose |
|---|---|
| `BaseLargeTitle` | 34pt page title that collapses into a blurred inline nav bar (17pt semibold, centered) on scroll. Slots: `leading` (back button), `trailing` (actions), `bottom` (search field, chips). Uses an IntersectionObserver on a sentinel to toggle the collapsed state. |
| `BaseSearchField` | Rounded fill-colored search input with magnifier icon and Cancel button on focus. `v-model` string. On phone it is placed in `BaseLargeTitle`'s `bottom` slot and revealed by pull-down; on desktop it is always visible. |
| `BaseSheet` | Phone: bottom sheet with grab handle, swipe-to-dismiss, `medium` / `large` detents, dimmed backdrop. Desktop: centered modal with sheet radius. `v-model` open state, `title` prop, default slot. |
| `BaseListGroup` | iOS inset grouped list container with optional `header` and `footer` text. |
| `BaseListRow` | Row inside a group: optional colored icon tile (`icon`, `iconColor`), `title`, `subtitle`, `value`, and an accessory (`chevron`, `toggle`, `check`, or none). Renders as `NuxtLink` when given `to`. Minimum height 44px. Inset separators. |
| `BaseSegmented` | iOS segmented control. `v-model`, `options: { value, label }[]`. |
| `BaseIcon` | See section 1. |

**Restyled existing components (props and events unchanged):**

- `BaseButton`: filled (tint background), tinted (tint at 15% alpha), and plain styles mapped from existing props. Press state is a scale/opacity change instead of a ripple.
- `BaseDialog`: re-skinned to match `BaseSheet` visually. Existing call sites keep working; migration to `BaseSheet` happens in later sub-projects.
- `BaseMenu`, `ContextMenu`: blurred material, 14px radius, iOS context-menu row style.
- `CrudTable`: inset grouped rows below 768px, clean borderless table above.
- `TheSnackbar` (in `Layout/LayoutParts`): pill-shaped toast that drops in from the top.
- Vuetify inputs, switches, checkboxes, chips: restyled through section 1 defaults and overrides.

**Rule:** existing component props and events stay backward compatible so every page keeps working before its own redesign.

## 3. App shell and navigation

**`frontend/app/components/Layout/DefaultLayout.vue`** is rebuilt around two new layout parts, chosen by Vuetify's `useDisplay()` breakpoint at 768px:

- **`TheTabBar.vue`** (phone): fixed bottom bar on regular material with blur, top hairline separator, padding for `env(safe-area-inset-bottom)`. Five tabs:
  - Recipes: `/g/{groupSlug}`
  - Plan: `/household/mealplan/planner/view`
  - Shopping: `/shopping-lists`
  - Cookbooks: `/g/{groupSlug}/cookbooks`
  - More: `/more`

  The active tab uses the filled icon and tint color. Tapping the already-active tab scrolls the page to the top.
- **`TheSidebar.vue`** (≥ 768px): translucent, collapsible sidebar replacing `AppSidebar`. Sections: Library (Recipes, Favorites, Timeline, Categories, Tags, Tools), Planning (Meal Plan, Shopping Lists), Cookbooks (each cookbook listed individually, from the existing cookbook store), Settings (Profile, Household, Group Data, Admin). Admin-only items keep the existing permission checks.

**Header:** `AppHeader` is removed from `DefaultLayout`. Pages show their title through `BaseLargeTitle`. During Foundation, a thin compatibility wrapper renders `BaseLargeTitle` with the page's existing title so pages not yet redesigned still get a proper header.

**More page:** new `frontend/app/pages/more.vue`, built from `BaseListGroup` / `BaseListRow`. Groups:
- Library: Timeline, Categories, Tags, Tools, Favorites.
- Account: Profile, Household, Group Data, Migrations.
- Admin (admins only): Site Settings, Users, Groups, Households, Backups, Maintenance.
- Appearance: accent tint picker (eight color dots), language, dark mode.

**Add recipe:** a `+` button in the Recipes page header opens a `BaseSheet` listing every import method: URL, Photo, AI, HTML, ZIP, Bulk, Manual. Each row links to the existing `/g/{groupSlug}/r/create/*` page. Methods hidden by current settings (for example AI when OpenAI is not configured) stay hidden.

**Transitions:** Nuxt page transitions: horizontal push/pop slide on phone, crossfade on desktop, none under reduced motion.

**PWA:** update `nuxt.config.ts` meta: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, `viewport-fit=cover`, and `theme-color` for light and dark.

**Auth pages:** login, register, forgot/reset password stay on the `basic` layout and pick up tokens and restyled inputs. Their full redesign is in sub-project 5.

## 4. Testing and verification

- **Dev environment:** backend via `uv run` with SQLite; frontend via the Nuxt dev server (`pnpm dev` in `frontend/`). `task` is not installed, so the raw commands behind the Taskfile targets are used.
- **Unit tests (Vitest), colocated per upstream convention:**
  - `use-tint`: default value, persistence, invalid-value fallback, storage-throws fallback.
  - `BaseIcon`: filled variant, Phosphor fallback, missing-icon warning.
  - `BaseSheet`: open/close via `v-model`, backdrop click closes.
  - `BaseLargeTitle`: collapsed state toggles when the sentinel leaves the viewport.
  - `TheTabBar`: renders five tabs, marks the active tab from the route.
- **Lint and tests:** frontend lint and Vitest (the commands behind `task ui:check`) pass.
- **Visual checks:** in the browser pane at 375px and desktop width, light and dark mode, for the shell, More page, add sheet, and a sample of unredesigned pages.
- **Reachability checklist:** every page listed under `frontend/app/pages/` that was reachable from the old navigation is opened through the new navigation and confirmed to render.

## Error handling and fallbacks

- Tint storage unavailable: default orange, no error shown.
- Icon missing in Framework7: Phosphor fallback; missing in both: dev-mode console warning, empty placeholder.
- No `backdrop-filter` support: solid elevated background.
- Server theme fetch fails: existing behavior (Vuetify defaults), with tint still applied.

## Out of scope

- Internal layout redesign of individual pages (sub-projects 2 to 5).
- Any backend, API, or database change.
- New features or feature removal.
- Changes to non-English locale files.
- Docker image build workflow (separate deploy step after Foundation).
