<template>
  <i
    v-if="fallback"
    :class="[filled ? 'ph-fill' : 'ph', `ph-${fallback}`, 'base-icon']"
    :style="{ fontSize: `${size}px` }"
    aria-hidden="true"
  />
  <i
    v-else
    class="f7-icons base-icon"
    :style="{ fontSize: `${size}px` }"
    aria-hidden="true"
  >{{ glyph }}</i>
</template>

<script setup lang="ts">
import { F7_FALLBACKS, F7_NO_FILL } from "~/lib/icons/f7-fallbacks";

const props = withDefaults(defineProps<{
  name: string;
  filled?: boolean;
  size?: number;
}>(), {
  filled: false,
  size: 22,
});

const fallback = computed(() => F7_FALLBACKS[props.name]);
const glyph = computed(() => (props.filled && !F7_NO_FILL.has(props.name) ? `${props.name}_fill` : props.name));
</script>

<style scoped>
.base-icon {
  display: inline-block;
  line-height: 1;
  font-style: normal;
  vertical-align: middle;
}
</style>
