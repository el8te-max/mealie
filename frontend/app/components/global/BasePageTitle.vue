<template>
  <div class="base-page-title">
    <div
      v-if="$slots.header"
      class="base-page-title__header"
    >
      <slot name="header" />
    </div>
    <BaseLargeTitle>
      <template #title>
        <slot name="title">
          👋 Here's a Title
        </slot>
      </template>
      <template
        v-if="$slots.default || $slots.content"
        #bottom
      >
        <p
          v-if="$slots.default"
          class="base-page-title__subtitle pro-subhead"
        >
          <slot />
        </p>
        <section class="d-flex">
          <slot name="content" />
        </section>
      </template>
    </BaseLargeTitle>
    <v-divider
      v-if="divider"
      class="my-4"
    />
  </div>
</template>

<script setup lang="ts">
import BaseLargeTitle from "./BaseLargeTitle.vue";

defineProps({
  divider: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.base-page-title__header {
  display: flex;
  padding: var(--pro-space-4) var(--pro-space-4) 0;
}

.base-page-title__header :deep(.v-img) {
  max-width: 64px !important;
  max-height: 64px;
}

.base-page-title__subtitle {
  margin: 0;
  color: var(--pro-label-secondary);
}
</style>
