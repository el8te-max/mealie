<template>
  <div
    class="user-tint-picker"
    role="radiogroup"
    :aria-label="$t('pro.accent-color')"
  >
    <button
      v-for="key in tintOptions"
      :key="key"
      type="button"
      role="radio"
      class="user-tint-picker__dot"
      :class="{ 'is-selected': key === tint }"
      :data-tint="key"
      :aria-checked="String(key === tint)"
      :aria-label="key"
      :style="{ background: TINTS[key].light }"
      @click="setTint(key)"
    />
  </div>
</template>

<script setup lang="ts">
import { TINTS, useTint } from "~/composables/use-tint";

const { tint, tintOptions, setTint } = useTint();
</script>

<style scoped>
.user-tint-picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pro-space-2);
}

.user-tint-picker__dot {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}

.user-tint-picker__dot.is-selected {
  box-shadow:
    0 0 0 2px var(--pro-bg-elevated),
    0 0 0 4px var(--pro-label-secondary);
}
</style>
