<template>
  <section class="base-list-group">
    <h3
      v-if="header"
      class="base-list-group__header"
    >
      {{ header }}
    </h3>
    <div class="base-list-group__body">
      <slot />
    </div>
    <p
      v-if="footer"
      class="base-list-group__footer"
    >
      {{ footer }}
    </p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  header?: string;
  footer?: string;
}>();
</script>

<style scoped>
.base-list-group {
  margin: 0 var(--pro-space-4) var(--pro-space-6);
}

.base-list-group__header {
  margin: 0 var(--pro-space-4) 6px;
  font-size: 13px;
  font-weight: 400;
  text-transform: uppercase;
  color: var(--pro-label-secondary);
}

.base-list-group__body {
  overflow: hidden;
  border-radius: var(--pro-radius-card);
  background: var(--pro-bg-elevated);
}

.base-list-group__footer {
  margin: 6px var(--pro-space-4) 0;
  font-size: 13px;
  color: var(--pro-label-secondary);
}
</style>
