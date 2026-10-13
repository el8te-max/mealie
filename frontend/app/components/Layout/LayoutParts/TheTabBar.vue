<template>
  <nav class="the-tab-bar">
    <NuxtLink
      v-for="item in items"
      :key="item.key"
      :to="item.to"
      :data-tab="item.key"
      class="the-tab-bar__tab"
      :class="{ 'is-active': item.key === activeKey }"
      :aria-current="item.key === activeKey ? 'page' : undefined"
      @click="onTap(item)"
    >
      <BaseIcon
        :name="item.icon"
        :filled="item.key === activeKey"
        :size="25"
      />
      <span class="the-tab-bar__label">{{ item.title }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import BaseIcon from "~/components/global/BaseIcon.vue";
import { findActiveKey, type NavItem } from "~/composables/use-app-nav";

const props = defineProps<{
  items: NavItem[];
  activePath: string;
}>();

// The most specific (longest) matching tab wins, so /g/home/cookbooks beats /g/home.
const activeKey = computed(() => findActiveKey(props.items, props.activePath));

function onTap(item: NavItem) {
  if (item.key === activeKey.value) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
</script>

<style scoped>
.the-tab-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1006;
  display: flex;
  justify-content: space-around;
  height: calc(49px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--pro-material-regular);
  backdrop-filter: var(--pro-blur);
  -webkit-backdrop-filter: var(--pro-blur);
  border-top: 0.5px solid var(--pro-separator);
}

.the-tab-bar__tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  color: #999;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.the-tab-bar__tab.is-active {
  color: var(--pro-tint);
}

.the-tab-bar__label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1px;
}
</style>
