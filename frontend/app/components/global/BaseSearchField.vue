<template>
  <div class="base-search-field">
    <label class="base-search-field__box">
      <BaseIcon
        name="search"
        :size="17"
        class="base-search-field__icon"
      />
      <input
        ref="input"
        type="search"
        :value="modelValue"
        :placeholder="placeholder ?? $t('search.search')"
        enterkeyhint="search"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown.enter="emit('submit')"
        @focus="focused = true"
        @blur="focused = false"
      >
    </label>
    <button
      v-if="focused"
      type="button"
      class="base-search-field__cancel"
      @mousedown.prevent
      @click="cancel"
    >
      {{ $t("general.cancel") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from "./BaseIcon.vue";

defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "submit": [];
}>();

const input = ref<HTMLInputElement | null>(null);
const focused = ref(false);

function cancel() {
  emit("update:modelValue", "");
  focused.value = false;
  input.value?.blur();
}
</script>

<style scoped>
.base-search-field {
  display: flex;
  align-items: center;
  gap: var(--pro-space-3);
}

.base-search-field__box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 var(--pro-space-2);
  border-radius: var(--pro-radius-control);
  background: var(--pro-fill);
  color: var(--pro-label-secondary);
}

.base-search-field__box input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--pro-label);
  font: inherit;
  font-size: 17px;
}

.base-search-field__box input::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

.base-search-field__cancel {
  border: 0;
  background: none;
  color: var(--pro-tint);
  font: inherit;
  font-size: 17px;
  cursor: pointer;
}
</style>
