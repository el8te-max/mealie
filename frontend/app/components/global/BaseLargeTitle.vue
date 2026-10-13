<template>
  <header class="base-large-title">
    <div
      class="base-large-title__bar"
      :class="{ 'is-visible': collapsed }"
      :aria-hidden="!collapsed"
      :inert="!collapsed"
    >
      <div class="base-large-title__side">
        <slot name="leading" />
      </div>
      <span class="base-large-title__inline pro-headline">
        <slot name="title">{{ title }}</slot>
      </span>
      <div class="base-large-title__side base-large-title__side--end">
        <slot name="trailing" />
      </div>
    </div>

    <div class="base-large-title__row">
      <h1 class="pro-large-title">
        <slot name="title">
          {{ title }}
        </slot>
      </h1>
      <div
        v-if="$slots.trailing"
        class="base-large-title__actions"
      >
        <slot name="trailing" />
      </div>
    </div>
    <div
      ref="sentinel"
      class="base-large-title__sentinel"
    />
    <div
      v-if="$slots.bottom"
      class="base-large-title__bottom"
    >
      <slot name="bottom" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>();

const sentinel = ref<HTMLElement | null>(null);
const collapsed = ref(false);
let observer: IntersectionObserver | undefined;

onMounted(() => {
  if (typeof IntersectionObserver === "undefined" || !sentinel.value) {
    return;
  }
  observer = new IntersectionObserver(([entry]) => {
    collapsed.value = !entry?.isIntersecting;
  });
  observer.observe(sentinel.value);
});

onBeforeUnmount(() => observer?.disconnect());

defineExpose({ collapsed });
</script>

<style scoped>
.base-large-title {
  padding: 0 var(--pro-space-4);
  color: var(--pro-label);
}

.base-large-title__bar {
  position: fixed;
  top: 0;
  right: 0;
  left: var(--pro-sidebar-width, 0px);
  z-index: 5;
  display: flex;
  align-items: center;
  height: calc(44px + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) var(--pro-space-2) 0;
  background: var(--pro-material-regular);
  backdrop-filter: var(--pro-blur);
  -webkit-backdrop-filter: var(--pro-blur);
  border-bottom: 0.5px solid var(--pro-separator);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--pro-dur-fast);
}

.base-large-title__bar.is-visible {
  opacity: 1;
  pointer-events: auto;
}

.base-large-title__side {
  flex: 1;
  display: flex;
  align-items: center;
}

.base-large-title__side--end {
  justify-content: flex-end;
}

.base-large-title__inline {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.base-large-title__row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--pro-space-3);
  padding-top: calc(var(--pro-space-3) + env(safe-area-inset-top));
}

.base-large-title__row h1 {
  margin: 0;
}

.base-large-title__actions {
  display: flex;
  align-items: center;
  gap: var(--pro-space-2);
  padding-bottom: 6px;
}

.base-large-title__sentinel {
  height: 1px;
}

.base-large-title__bottom {
  padding: var(--pro-space-2) 0 var(--pro-space-3);
}
</style>
