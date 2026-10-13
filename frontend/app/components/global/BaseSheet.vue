<template>
  <Teleport :to="teleportTarget">
    <Transition name="base-sheet">
      <div
        v-if="modelValue"
        class="base-sheet"
        :class="isPhone ? 'is-phone' : 'is-desktop'"
      >
        <div
          class="base-sheet__backdrop"
          @click="close"
        />
        <div
          ref="panel"
          class="base-sheet__panel"
          :class="`detent-${detent}`"
          :style="dragStyle"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
          @keydown.esc="close"
        >
          <div
            v-if="isPhone"
            class="base-sheet__grab"
            @pointerdown="onDragStart"
          />
          <h2
            v-if="title"
            class="base-sheet__title pro-headline"
          >
            {{ title }}
          </h2>
          <div class="base-sheet__content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;
  detent?: "medium" | "large";
}>(), {
  title: undefined,
  detent: "medium",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const isPhone = useMediaQuery("(max-width: 767px)");
// Teleport inside the Vuetify app (not <body>) so the .v-theme--dark tokens cascade into the sheet.
const teleportTarget = ref<HTMLElement | string>("body");

function resolveTeleportTarget() {
  teleportTarget.value = document.querySelector<HTMLElement>(".v-application") ?? "body";
}
const panel = ref<HTMLElement | null>(null);
let previousFocus: HTMLElement | null = null;

function close() {
  emit("update:modelValue", false);
}

watch(() => props.modelValue, async (open) => {
  if (open) {
    // Resolved on open, not at setup: the app root may not be mounted yet when this component is created.
    resolveTeleportTarget();
    previousFocus = document.activeElement as HTMLElement | null;
    await nextTick();
    panel.value?.focus();
  }
  else {
    previousFocus?.focus?.();
  }
}, { immediate: true });

// Swipe-to-dismiss from the grab handle.
const dragOffset = ref(0);
const dragStyle = computed(() => (dragOffset.value > 0 ? { transform: `translateY(${dragOffset.value}px)`, transition: "none" } : undefined));

function onDragStart(start: PointerEvent) {
  const startY = start.clientY;
  const startTime = performance.now();

  function onMove(event: PointerEvent) {
    dragOffset.value = Math.max(0, event.clientY - startY);
  }
  function onUp() {
    const velocity = dragOffset.value / Math.max(1, performance.now() - startTime);
    if (dragOffset.value > 100 || velocity > 0.5) {
      close();
    }
    dragOffset.value = 0;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  }
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}
</script>

<style scoped>
.base-sheet {
  position: fixed;
  inset: 0;
  z-index: 2400;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.base-sheet.is-desktop {
  align-items: center;
}

.base-sheet__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.base-sheet__panel {
  position: relative;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  padding: 8px 0 calc(var(--pro-space-5) + env(safe-area-inset-bottom));
  background: var(--pro-bg-grouped);
  color: var(--pro-label);
  border-radius: var(--pro-radius-sheet) var(--pro-radius-sheet) 0 0;
  outline: none;
  transition: transform var(--pro-dur) var(--pro-ease-spring);
}

.is-phone .detent-large {
  height: 92vh;
}

.is-desktop .base-sheet__panel {
  max-width: 540px;
  max-height: 80vh;
  padding-top: var(--pro-space-5);
  border-radius: var(--pro-radius-sheet);
}

.base-sheet__grab {
  width: 36px;
  height: 5px;
  margin: 0 auto var(--pro-space-3);
  border-radius: 3px;
  background: var(--pro-label-tertiary);
  cursor: grab;
  touch-action: none;
}

.base-sheet__title {
  margin: 0 0 var(--pro-space-4);
  text-align: center;
}

/* Enter/leave: phone slides up, desktop scales in. */
.base-sheet-enter-active,
.base-sheet-leave-active {
  transition: opacity var(--pro-dur) var(--pro-ease-spring);
}

.base-sheet-enter-active .base-sheet__panel,
.base-sheet-leave-active .base-sheet__panel {
  transition: transform var(--pro-dur) var(--pro-ease-spring);
}

.base-sheet-enter-from,
.base-sheet-leave-to {
  opacity: 0;
}

.is-phone.base-sheet-enter-from .base-sheet__panel,
.is-phone.base-sheet-leave-to .base-sheet__panel {
  transform: translateY(100%);
}

.is-desktop.base-sheet-enter-from .base-sheet__panel,
.is-desktop.base-sheet-leave-to .base-sheet__panel {
  transform: scale(0.95);
}
</style>
