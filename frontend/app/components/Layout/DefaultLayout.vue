<template>
  <v-app
    class="pro-app"
    :class="{ 'has-sidebar': showSidebar, 'has-tab-bar': !isWide }"
    :style="{ '--pro-sidebar-width': showSidebar ? '260px' : '0px' }"
  >
    <TheSnackbar />
    <AnnouncementDialog v-model="announcementsDialog" />
    <LanguageDialog v-model="languageDialog" />

    <TheSidebar
      v-if="isWide"
      v-model:collapsed="sidebarCollapsed"
      :sections="nav.sidebar"
      :active-path="route.path"
      @action="handleNavAction"
    />

    <v-main class="pro-main">
      <NuxtPage />
    </v-main>

    <TheTabBar
      v-if="!isWide"
      :items="nav.tabs"
      :active-path="route.path"
    />
  </v-app>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import AnnouncementDialog from "~/components/Domain/Announcement/AnnouncementDialog.vue";
import TheSidebar from "~/components/Layout/LayoutParts/TheSidebar.vue";
import TheTabBar from "~/components/Layout/LayoutParts/TheTabBar.vue";
import { useAppNav } from "~/composables/use-app-nav";
import { useNavActions } from "~/composables/use-nav-actions";

const route = useRoute();
const display = useDisplay();
const nav = useAppNav();
const { handleNavAction, languageDialog, announcementsDialog } = useNavActions();

const isWide = computed(() => display.width.value >= 768);
const sidebarCollapsed = useLocalStorage("mealie-pro-sidebar-collapsed", false);
const showSidebar = computed(() => isWide.value && !sidebarCollapsed.value);
</script>

<style scoped>
.pro-main {
  background: var(--pro-bg-grouped);
}

.has-sidebar .pro-main {
  padding-left: 260px !important;
}

.has-tab-bar .pro-main {
  padding-bottom: calc(49px + env(safe-area-inset-bottom)) !important;
}
</style>
