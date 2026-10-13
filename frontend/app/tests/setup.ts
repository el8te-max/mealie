import { config } from "@vue/test-utils";
import { createI18n } from "vue-i18n";

function loadEnLocales() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("../lang/messages/en-US.json") as Record<string, string>;
}

const i18n = createI18n({
  locale: "en-US",
  messages: {
    "en-US": loadEnLocales(),
  },
});

config.global.plugins = [...(config.global.plugins ?? []), i18n];

export { i18n };

// Node 22+ ships a global `localStorage` that is undefined without --localstorage-file and
// shadows jsdom's. Point both storage globals back at jsdom's implementation.
const jsdomWindow = (globalThis as { jsdom?: { window: Window } }).jsdom?.window;
if (jsdomWindow) {
  for (const key of ["localStorage", "sessionStorage"] as const) {
    Object.defineProperty(globalThis, key, { value: jsdomWindow[key], configurable: true, writable: true });
  }
}
