<template>
  <div
    class="base-segmented"
    role="tablist"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      class="base-segmented__segment"
      :class="{ 'is-selected': option.value === modelValue }"
      :aria-selected="String(option.value === modelValue)"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
type Value = string | number;

defineProps<{
  modelValue: Value;
  options: { value: Value; label: string }[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: Value];
}>();
</script>

<style scoped>
.base-segmented {
  display: flex;
  padding: 2px;
  border-radius: 9px;
  background: var(--pro-fill);
}

.base-segmented__segment {
  flex: 1;
  padding: 6px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--pro-label);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--pro-dur-fast) var(--pro-ease-spring);
}

.base-segmented__segment.is-selected {
  background: var(--pro-bg-elevated);
  font-weight: 600;
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.12),
    0 3px 1px rgba(0, 0, 0, 0.04);
}
</style>
