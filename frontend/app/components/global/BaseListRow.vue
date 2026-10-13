<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="base-list-row"
    @click="emit('click')"
  >
    <BaseListRowContent />
  </NuxtLink>
  <div
    v-else-if="resolvedAccessory === 'toggle'"
    class="base-list-row"
  >
    <BaseListRowContent />
  </div>
  <button
    v-else
    type="button"
    class="base-list-row"
    @click="emit('click')"
  >
    <BaseListRowContent />
  </button>
</template>

<script setup lang="ts">
import BaseIcon from "./BaseIcon.vue";

type Accessory = "chevron" | "toggle" | "check" | "none";

const props = defineProps<{
  title: string;
  subtitle?: string;
  value?: string;
  icon?: string;
  iconColor?: string;
  to?: string;
  accessory?: Accessory;
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  "click": [];
  "update:modelValue": [value: boolean];
}>();

const resolvedAccessory = computed<Accessory>(() => props.accessory ?? (props.to ? "chevron" : "none"));

// Shared inner markup for the three root variants.
const BaseListRowContent = () => [
  props.icon
    ? h("span", { class: "base-list-row__icon", style: { background: props.iconColor ?? "var(--pro-tint)" } }, [
        h(BaseIcon, { name: props.icon, filled: true, size: 18 }),
      ])
    : null,
  h("span", { class: "base-list-row__text" }, [
    h("span", { class: "base-list-row__title" }, props.title),
    props.subtitle ? h("span", { class: "base-list-row__subtitle" }, props.subtitle) : null,
  ]),
  props.value ? h("span", { class: "base-list-row__value" }, props.value) : null,
  resolvedAccessory.value === "chevron"
    ? h(BaseIcon, { name: "chevron_right", size: 14, class: "base-list-row__chevron" })
    : null,
  resolvedAccessory.value === "check" && props.modelValue
    ? h(BaseIcon, { name: "checkmark", size: 17, class: "base-list-row__check" })
    : null,
  resolvedAccessory.value === "toggle"
    ? h("button", {
        "type": "button",
        "role": "switch",
        "aria-checked": String(!!props.modelValue),
        "aria-label": props.title,
        "class": ["base-list-row__switch", { "is-on": props.modelValue }],
        "onClick": () => emit("update:modelValue", !props.modelValue),
      }, [h("span", { class: "base-list-row__knob" })])
    : null,
];
</script>

<style scoped>
.base-list-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--pro-space-3);
  width: 100%;
  min-height: 44px;
  padding: 6px var(--pro-space-4);
  color: var(--pro-label);
  background: transparent;
  border: 0;
  font: inherit;
  font-size: 17px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

div.base-list-row {
  cursor: default;
}

.base-list-row:active:not(div) {
  background: var(--pro-fill);
}

/* Inset hairline between rows, starting at the text. */
.base-list-row + .base-list-row::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  left: var(--pro-space-4);
  border-top: 0.5px solid var(--pro-separator);
}

.base-list-row:has(.base-list-row__icon) + .base-list-row::before,
.base-list-row + .base-list-row:has(.base-list-row__icon)::before {
  left: 58px;
}

:deep(.base-list-row__icon) {
  flex: none;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  color: #fff;
}

:deep(.base-list-row__text) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

:deep(.base-list-row__subtitle) {
  font-size: 13px;
  color: var(--pro-label-secondary);
}

:deep(.base-list-row__value) {
  color: var(--pro-label-secondary);
}

:deep(.base-list-row__chevron) {
  color: var(--pro-label-tertiary);
}

:deep(.base-list-row__check) {
  color: var(--pro-tint);
}

:deep(.base-list-row__switch) {
  position: relative;
  flex: none;
  width: 51px;
  height: 31px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--pro-fill);
  cursor: pointer;
  transition: background var(--pro-dur-fast);
}

:deep(.base-list-row__switch.is-on) {
  background: var(--pro-tint);
}

:deep(.base-list-row__knob) {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: #fff;
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.15),
    0 1px 1px rgba(0, 0, 0, 0.16);
  transition: transform var(--pro-dur-fast) var(--pro-ease-spring);
}

:deep(.base-list-row__switch.is-on .base-list-row__knob) {
  transform: translateX(20px);
}
</style>
