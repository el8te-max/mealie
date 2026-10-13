<template>
  <button
    v-if="collapsed"
    type="button"
    class="the-sidebar__reopen"
    :aria-label="$t('pro.show-sidebar')"
    @click="collapsed = false"
  >
    <BaseIcon
      name="sidebar_left"
      :size="22"
    />
  </button>
  <aside
    v-else
    class="the-sidebar"
  >
    <div class="the-sidebar__top">
      <button
        type="button"
        class="the-sidebar__toggle"
        :aria-label="$t('pro.hide-sidebar')"
        @click="collapsed = true"
      >
        <BaseIcon
          name="sidebar_left"
          :size="22"
        />
      </button>
    </div>

    <nav>
      <section
        v-for="section in sections"
        :key="section.key"
        class="the-sidebar__section"
      >
        <h2
          v-if="section.title"
          class="the-sidebar__heading"
        >
          {{ section.title }}
        </h2>
        <template
          v-for="item in section.items"
          :key="item.key"
        >
          <button
            v-if="item.children"
            type="button"
            class="the-sidebar__row"
            :aria-expanded="String(!!expanded[item.key])"
            @click="expanded[item.key] = !expanded[item.key]"
          >
            <BaseIcon
              :name="item.icon"
              :size="17"
              class="the-sidebar__icon"
            />
            <span class="the-sidebar__title">{{ item.title }}</span>
            <BaseIcon
              :name="expanded[item.key] ? 'chevron_down' : 'chevron_right'"
              :size="12"
              class="the-sidebar__chevron"
            />
          </button>
          <div
            v-if="item.children && expanded[item.key]"
            class="the-sidebar__children"
          >
            <NuxtLink
              v-for="child in item.children"
              :key="child.key"
              :to="child.to"
              class="the-sidebar__row"
              :class="{ 'is-active': child.key === activeKey }"
            >
              <BaseIcon
                :name="child.icon"
                :size="17"
                class="the-sidebar__icon"
              />
              <span class="the-sidebar__title">{{ child.title }}</span>
            </NuxtLink>
          </div>
          <button
            v-if="!item.children && item.action"
            type="button"
            class="the-sidebar__row"
            @click="emit('action', item.action)"
          >
            <BaseIcon
              :name="item.icon"
              :size="17"
              class="the-sidebar__icon"
            />
            <span class="the-sidebar__title">{{ item.title }}</span>
          </button>
          <NuxtLink
            v-if="!item.children && !item.action"
            :to="item.to"
            class="the-sidebar__row"
            :class="{ 'is-active': item.key === activeKey }"
          >
            <BaseIcon
              :name="item.icon"
              :filled="item.key === activeKey"
              :size="17"
              class="the-sidebar__icon"
            />
            <span class="the-sidebar__title">{{ item.title }}</span>
          </NuxtLink>
        </template>
      </section>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import BaseIcon from "~/components/global/BaseIcon.vue";
import { findActiveKey, type NavAction, type NavItem, type NavSection } from "~/composables/use-app-nav";

const props = defineProps<{
  sections: NavSection[];
  activePath: string;
}>();

const emit = defineEmits<{
  action: [action: NavAction];
}>();

const collapsed = defineModel<boolean>("collapsed", { default: false });
const expanded = reactive<Record<string, boolean>>({});

const activeKey = computed(() => {
  const flat = props.sections.flatMap(s => s.items.flatMap((i): NavItem[] => [i, ...(i.children ?? [])]));
  return findActiveKey(flat, props.activePath);
});
</script>

<style scoped>
.the-sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1006;
  width: 260px;
  overflow-y: auto;
  padding: calc(var(--pro-space-3) + env(safe-area-inset-top)) var(--pro-space-3) var(--pro-space-6);
  background: var(--pro-material-thin);
  backdrop-filter: var(--pro-blur);
  -webkit-backdrop-filter: var(--pro-blur);
  border-right: 0.5px solid var(--pro-separator);
  color: var(--pro-label);
}

.the-sidebar__top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--pro-space-2);
}

.the-sidebar__toggle,
.the-sidebar__reopen {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: var(--pro-radius-control);
  background: transparent;
  color: var(--pro-tint);
  cursor: pointer;
}

.the-sidebar__reopen {
  position: fixed;
  top: calc(var(--pro-space-2) + env(safe-area-inset-top));
  left: var(--pro-space-2);
  z-index: 1006;
  background: var(--pro-material-regular);
  backdrop-filter: var(--pro-blur);
  -webkit-backdrop-filter: var(--pro-blur);
}

.the-sidebar__section + .the-sidebar__section {
  margin-top: var(--pro-space-4);
}

.the-sidebar__heading {
  margin: 0 var(--pro-space-2) var(--pro-space-1);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--pro-label-secondary);
}

.the-sidebar__row {
  display: flex;
  align-items: center;
  gap: var(--pro-space-2);
  width: 100%;
  min-height: 32px;
  padding: 4px var(--pro-space-2);
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 14px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.the-sidebar__row:hover {
  background: var(--pro-fill-secondary);
}

.the-sidebar__row.is-active {
  background: var(--pro-fill);
  font-weight: 600;
}

.the-sidebar__icon {
  color: var(--pro-tint);
}

.the-sidebar__title {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.the-sidebar__chevron {
  color: var(--pro-label-tertiary);
}

.the-sidebar__children {
  padding-left: var(--pro-space-4);
}
</style>
