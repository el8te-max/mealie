# SDD ledger — plan: docs/superpowers/plans/2026-10-13-foundation.md
Setup: no worktree — working on feature branch `pro` (not main), user-approved repo layout. Workspace excluded via .git/info/exclude.
Pre-flight:
- T2 use-tint produces applyTint/useTint → T11 UserTintPicker consumes useTint.setTint: consistent.
- T3 BaseIcon(name, filled, size) → T4,T6,T9 consume: consistent.
- T8 NavItem/buildAppNav → T9 TheTabBar(items: NavItem[]), T10/T11 consume nav.tabs/sidebar/more/createMethods: consistent.
- T10 handleNavAction → T11 extracts to use-nav-actions.ts and DefaultLayout imports it: consistent (T11 refactors T10).
- T6 BasePageTitle via BaseLargeTitle vs spec "thin compatibility wrapper": Ruling: restyle BasePageTitle instead of a new wrapper — same outcome for unredesigned pages with less code — cost if wrong: pages not using BasePageTitle lack large title until their sub-project.
Task 0: complete (commits a8b4aa1..f9afa5f, tests: pnpm -C frontend exec vitest run →    Duration  6.84s (transform 3.96s, setup 3.66s, import 6.42s, tests 1.41s, environment 23.50s))
Task 1: Ruling: also set Vuetify background/surface to iOS grouped colors in plugins/theme.ts (light #F2F2F7/#FFFFFF, dark #000000/#1C1C1E) and the pre-paint script — spec only named primary, but the iOS look needs matching page backgrounds — cost if wrong: revert 4 color values.
Task 1: complete (commits f9afa5f..e96f78d, tests: pnpm -C frontend lint --max-warnings=0 → $ eslint . --max-warnings=0)
Task 2: Ruling: applyTint writes --pro-tint-light/--pro-tint-dark on :root and tokens.scss derives --pro-tint from them per theme (test changed from --pro-tint to these two) — the dark theme class redefines --pro-tint on a descendant, so a single root --pro-tint would be overridden in dark mode — cost if wrong: none functionally.
Task 2: Ruling: test setup re-points localStorage/sessionStorage globals at jsdom's — Node 26's built-in localStorage shadows jsdom's and is undefined without --localstorage-file — cost if wrong: none outside tests.
Task 2: complete (commits e96f78d..31c22e4, tests: pnpm -C frontend exec vitest run →    Duration  6.42s (transform 3.63s, setup 3.63s, import 5.52s, tests 1.24s, environment 22.62s))
Task 3: Ruling: no runtime 'missing in both sets' warning — a ligature font gives no signal that a glyph is missing; F7_FALLBACKS/F7_NO_FILL were built by checking every planned name against framework7-icons/svg instead. calendar has no _fill, so the Plan tab shows tint color only when active — cost if wrong: an unknown name renders as literal text.
Task 3: complete (commits 31c22e4..edafeb7, tests: pnpm -C frontend exec vitest run →    Duration  6.62s (transform 3.62s, setup 3.74s, import 6.48s, tests 1.41s, environment 22.52s))
Task 4: complete (commits edafeb7..fca3499, tests: pnpm -C frontend exec vitest run →    Duration  6.97s (transform 3.89s, setup 3.64s, import 6.23s, tests 1.45s, environment 24.28s))
Task 5: complete (commits fca3499..eafc942, tests: pnpm -C frontend exec vitest run →    Duration  7.15s (transform 3.78s, setup 3.91s, import 6.28s, tests 1.57s, environment 24.63s))
Task 6: Ruling: BaseLargeTitle accepts a 'title' slot as well as the prop — BasePageTitle passes its title as a slot, not a string — cost if wrong: none.
Task 6: complete (commits eafc942..35ede57, tests: pnpm -C frontend exec vitest run →    Duration  7.53s (transform 3.96s, setup 4.10s, import 6.61s, tests 1.61s, environment 26.55s))
Task 7: Ruling: CrudTable keeps v-data-table on phones (iOS-styled card, hairlines, filled search) instead of switching to BaseListRow rows — the row view would drop bulk select, sort, pagination and per-row delete, breaking "all features stay" — cost if wrong: data tables look less native on phones until sub-project 5.
Task 7: Ruling: dialog header restyled in BaseDialogContent.vue (not listed in plan files) and BaseMenu/ContextMenu restyled via global CSS in vuetify-overrides.scss rather than per-component edits — the visuals live in those places — cost if wrong: none; the dialog icon prop is now unused visually.
Task 7: Ruling: BaseDialog stays fullscreen on xs (iOS full-screen modal) rather than forcing a bottom sheet — forcing the sheet risks clipping long forms — cost if wrong: phone dialogs are full-screen, not sheets.
Task 7: complete (commits 35ede57..9f056f4, tests: pnpm -C frontend exec vitest run →    Duration  7.35s (transform 3.71s, setup 4.07s, import 6.17s, tests 1.68s, environment 25.68s))
Task 8: Ruling: Language and Dark Mode are offered to visitors too (old sidebar's Settings menu showed them regardless of login); announcements only when logged in and enabled, as before. Added pro.import-url/import-photo/create-manually keys beyond the plan's list for short sheet labels — cost if wrong: copy tweaks.
Task 8: complete (commits 9f056f4..9249fb5, tests: pnpm -C frontend exec vitest run →    Duration  7.70s (transform 3.97s, setup 4.23s, import 6.65s, tests 1.54s, environment 26.97s))
Task 9: Ruling: added optional NavItem.match (Plan tab matches /household/mealplan so planner edit/settings keep it active) and shared findActiveKey() in use-app-nav.ts used by tab bar and sidebar; sidebar collapse hides it fully and shows a floating reopen button — cost if wrong: minor UX tweak.
Task 9: complete (commits 9249fb5..a20e169, tests: pnpm -C frontend exec vitest run →    Duration  7.87s (transform 4.12s, setup 4.21s, import 6.87s, tests 1.76s, environment 27.46s))
Task 10: Ruling: page transitions use the existing nuxt `app.viewTransition: true` plus ::view-transition CSS (slide on phones, crossfade on desktop, none under reduced motion) instead of adding `app.pageTransition` — both together would double-animate — cost if wrong: browsers without View Transitions get no animation.
Task 10: Ruling: use-nav-actions.ts created here (plan put the extraction in Task 11); dialog state shared via useState so the layout renders Language/Announcement dialogs once — cost if wrong: none.
Task 10: Ruling: admin pages keep the separate `admin` layout (old header + sidebar with developer links) — plan/spec did not cover it; moving it would drop the developer debug links from navigation — deferred to sub-project 5 — cost if wrong: admin pages look old until then.
Task 10: Ruling: recipes home shows a "Recipes" large title above RecipeExplorerPage, which still has its own inner "Recipes" header — removing that belongs to sub-project 2 — cost if wrong: duplicate heading on the home page until then.
Task 10: Visitor check could not run in the browser — the seeded group is private, so /g/home redirects to /login; covered by buildAppNav visitor unit test.
Task 10: complete (commits a20e169..020a1c9, tests: pnpm -C frontend exec vitest run →    Duration  7.94s (transform 4.05s, setup 4.23s, import 6.62s, tests 1.57s, environment 28.92s))
Task 11: complete (commits 020a1c9..278df4e, tests: pnpm -C frontend exec vitest run →    Duration  7.98s (transform 4.37s, setup 4.38s, import 6.92s, tests 1.66s, environment 28.11s))
Task 12: Ruling: removed "From Photo" from the add sheet — upstream v3.28.0 turned /r/create/image into a redirect to /r/create/ai, so photo import lives inside "Import with AI" (shown only when AI is enabled) — spec listed Photo separately — cost if wrong: none; photo import was never available without AI in this version.
Task 12: Reachability sweep (admin, phone width): all 27 routes rendered; /group/data → /group/data/foods and /r/create/image → /r/create/ai are upstream redirects. Console errors were transient dev-server 503/404 resource loads, no JS errors.
Task 12: complete (commits 278df4e..92b4869, tests: pnpm -C frontend exec vitest run →    Duration  8.07s (transform 4.47s, setup 4.57s, import 7.32s, tests 1.66s, environment 28.85s))
Final review: fresh reviewer (opus subagent). Verdict: with fixes. 0 Critical, 5 Important, 12 Minor.
Final: Ruling: re-graded Minor #3 (prototype keys like "constructor" pass tint validation) to Important — a corrupted stored tint breaks theme generation, the same input class as Review Focus #5 — cost if wrong: one extra small fix.
Final: fixed .v-card override stripping colored cards — verified in browser (bg-transparent card keeps rgba(0,0,0,0)); CSS, no unit test possible.
Final: fixed BaseSheet light colors in dark mode — "teleports inside the Vuetify app" RED→GREEN, suite 475/475; browser: panel rgb(0,0,0) in dark.
Final: fixed visitor /more broken /g/ links — "without a group slug, links never point at /g/" RED→GREEN, suite 475/475.
Final: fixed phone visitors unable to reach public cookbooks — "More lists cookbooks..." RED→GREEN, suite 475/475.
Final: fixed dropped global recipe search — "recipe search is offered in the sidebar and on More" RED→GREEN, suite 475/475; browser: search dialog opens from More; "/" shortcut restored in DefaultLayout.
Final: fixed inherited-key tint values — "rejects inherited object keys" RED→GREEN, suite 475/475.
Final: minor (deferred): scroll-to-top button sits under the phone tab bar.
Final: minor (deferred): sidebar reopen button overlaps the large title when collapsed.
Final: minor (deferred): Profile/Household/Admin hidden from sidebar when viewing another group.
Final: minor (deferred): announcements lost unread badge.
Final: minor (deferred): sidebar Dark Mode label doesn't flip to Light Mode.
Final: minor (deferred): BaseSheet lacks focus trap / scroll lock; z-index above Vuetify menus.
Final: minor (deferred): no tab active on pages opened from More (e.g. /user/profile).
Final: minor (deferred): tint picker aria-labels untranslated.
Final: minor (deferred): cookbook slug can collide with nav keys in sidebar active state.
Final: minor (deferred): RecipeActionMenu sticky offsets assume old 48px app bar (sub-project 2).
Final: minor (deferred): theme-color meta ignores manual dark toggle.
