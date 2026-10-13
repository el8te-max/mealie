import { computed } from "vue";
import { StorageSerializers, useLocalStorage } from "@vueuse/core";
import type { ThemeInstance } from "vuetify";

export type TintKey = "orange" | "red" | "pink" | "purple" | "indigo" | "blue" | "teal" | "green";

/** iOS system colors, light and dark variants. */
export const TINTS: Record<TintKey, { light: string; dark: string }> = {
  orange: { light: "#FF9500", dark: "#FF9F0A" },
  red: { light: "#FF3B30", dark: "#FF453A" },
  pink: { light: "#FF2D55", dark: "#FF375F" },
  purple: { light: "#AF52DE", dark: "#BF5AF2" },
  indigo: { light: "#5856D6", dark: "#5E5CE6" },
  blue: { light: "#007AFF", dark: "#0A84FF" },
  teal: { light: "#30B0C7", dark: "#40C8E0" },
  green: { light: "#34C759", dark: "#30D158" },
};

export const TINT_STORAGE_KEY = "mealie-pro-tint";
const DEFAULT_TINT: TintKey = "orange";

export function resolveTint(raw: unknown): TintKey {
  return typeof raw === "string" && Object.hasOwn(TINTS, raw) ? (raw as TintKey) : DEFAULT_TINT;
}

/** Reads the stored tint without VueUse, for use before the app mounts. */
export function readStoredTint(): TintKey {
  try {
    return resolveTint(localStorage.getItem(TINT_STORAGE_KEY));
  }
  catch {
    return DEFAULT_TINT;
  }
}

export function useTint() {
  let stored: { value: string };
  try {
    stored = useLocalStorage<string>(TINT_STORAGE_KEY, DEFAULT_TINT, { serializer: StorageSerializers.string, flush: "sync" });
  }
  catch {
    stored = ref<string>(DEFAULT_TINT);
  }

  const tint = computed<TintKey>(() => resolveTint(stored.value));

  function setTint(key: TintKey) {
    stored.value = resolveTint(key);
  }

  return { tint, tintOptions: Object.keys(TINTS) as TintKey[], setTint };
}

/** Pushes a tint into the CSS tokens and, when given, Vuetify's primary color. */
export function applyTint(key: TintKey, theme?: ThemeInstance) {
  const { light, dark } = TINTS[resolveTint(key)];
  const style = document.documentElement.style;
  style.setProperty("--pro-tint-light", light);
  style.setProperty("--pro-tint-dark", dark);

  if (theme) {
    const themes = theme.themes.value;
    if (themes.light) themes.light.colors.primary = light;
    if (themes.dark) themes.dark.colors.primary = dark;
  }
}
