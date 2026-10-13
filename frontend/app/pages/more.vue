<template>
  <div class="more-page">
    <BaseLargeTitle :title="$t('pro.more')" />

    <BaseListGroup
      v-for="section in nav.more"
      :key="section.key"
      :header="section.title || undefined"
    >
      <template
        v-for="item in section.items"
        :key="item.key"
      >
        <BaseListRow
          v-if="item.action === 'toggle-dark'"
          :title="item.title"
          :icon="item.icon"
          :icon-color="iconColor(item.key)"
          accessory="toggle"
          :model-value="isDark"
          @update:model-value="isDark = $event"
        />
        <BaseListRow
          v-else-if="item.action"
          :title="item.title"
          :icon="item.icon"
          :icon-color="iconColor(item.key)"
          :class="{ 'more-page__destructive': item.action === 'logout' }"
          @click="handleNavAction(item.action)"
        />
        <BaseListRow
          v-else
          :title="item.title"
          :icon="item.icon"
          :icon-color="iconColor(item.key)"
          :to="item.to"
        />
      </template>
      <div
        v-if="section.key === 'appearance'"
        class="more-page__tint"
      >
        <span>{{ $t("pro.accent-color") }}</span>
        <UserTintPicker />
      </div>
    </BaseListGroup>
  </div>
</template>

<script setup lang="ts">
import { useDark } from "@vueuse/core";
import UserTintPicker from "~/components/Domain/User/UserTintPicker.vue";
import { useAppNav } from "~/composables/use-app-nav";
import { useNavActions } from "~/composables/use-nav-actions";

const i18n = useI18n();
useSeoMeta({ title: i18n.t("pro.more") });

const nav = useAppNav();
const { handleNavAction } = useNavActions();
const isDark = useDark();

// iOS system colors for settings-style icon tiles.
const ICON_COLORS: Record<string, string> = {
  "finder": "#007AFF",
  "favorites": "#FF2D55",
  "timeline": "#5856D6",
  "categories": "#34C759",
  "tags": "#FF9500",
  "tools": "#FF3B30",
  "profile": "#007AFF",
  "household": "#FF9500",
  "data": "#AF52DE",
  "migrations": "#30B0C7",
  "toggle-dark": "#5856D6",
  "language": "#007AFF",
  "announcements": "#FF3B30",
  "logout": "#8E8E93",
  "login": "#34C759",
};

function iconColor(key: string) {
  return ICON_COLORS[key] ?? "#8E8E93";
}
</script>

<style scoped>
.more-page {
  padding-bottom: var(--pro-space-6);
}

.more-page__tint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--pro-space-3);
  padding: 10px var(--pro-space-4);
  border-top: 0.5px solid var(--pro-separator);
  font-size: 17px;
}

.more-page__destructive :deep(.base-list-row__title) {
  color: #ff3b30;
}
</style>
