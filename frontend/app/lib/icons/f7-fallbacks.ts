/** Framework7 names with no glyph in framework7-icons 5.0.5, mapped to a Phosphor icon name. */
export const F7_FALLBACKS: Record<string, string> = {
  megaphone: "megaphone",
};

/** Framework7 glyphs that exist but have no `_fill` variant; `filled` is ignored for these. */
export const F7_NO_FILL = new Set<string>([
  "calendar",
  "search",
  "link",
  "sparkles",
  "pencil",
  "chevron_right",
  "chevron_left",
  "chevron_left_slash_chevron_right",
  "globe",
  "xmark",
  "checkmark",
  "gauge",
  "list_bullet",
]);
