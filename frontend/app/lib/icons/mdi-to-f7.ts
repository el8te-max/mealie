import type { icons } from "./icons";

type MdiKey = keyof typeof icons;

/** Material Design icon keys (`$globals.icons.*`) to their Framework7 equivalents. */
export const MDI_TO_F7: Partial<Record<MdiKey, string>> = {
  silverwareForkKnife: "book",
  calendarMultiselect: "calendar",
  formatListCheck: "cart",
  book: "bookmark",
  pages: "bookmark",
  timelineText: "clock",
  tags: "tag",
  categories: "square_grid_2x2",
  organizers: "square_grid_2x2",
  potSteam: "flame",
  cog: "gear_alt",
  wrench: "wrench",
  manageData: "tray_full",
  search: "search",
  link: "link",
  autoFix: "sparkles",
  edit: "pencil",
  createAlt: "plus_circle",
  heart: "heart",
  weatherSunny: "sun_max",
  weatherNight: "moon",
  logout: "arrow_right_square",
};

export function mdiToF7(key: MdiKey): string | undefined {
  return MDI_TO_F7[key];
}
