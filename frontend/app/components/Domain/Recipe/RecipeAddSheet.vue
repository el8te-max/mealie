<template>
  <BaseSheet
    v-model="open"
    :title="$t('pro.add-recipe')"
  >
    <BaseListGroup>
      <BaseListRow
        v-for="method in nav.createMethods"
        :key="method.key"
        :title="method.title"
        :icon="method.icon"
        :icon-color="colors[method.key]"
        :to="method.to"
        @click="open = false"
      />
    </BaseListGroup>
  </BaseSheet>
</template>

<script setup lang="ts">
import { useAppNav } from "~/composables/use-app-nav";

const open = defineModel<boolean>({ default: false });
const nav = useAppNav();

// iOS system colors for the method icon tiles.
const colors: Record<string, string> = {
  url: "#007AFF",
  image: "#34C759",
  ai: "#AF52DE",
  html: "#FF9500",
  zip: "#8E8E93",
  bulk: "#5856D6",
  manual: "#FF3B30",
};
</script>
