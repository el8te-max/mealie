<template>
  <div>
    <BaseLargeTitle :title="$t('general.recipes')">
      <template
        v-if="isOwnGroup"
        #trailing
      >
        <button
          type="button"
          class="recipes-add"
          :aria-label="$t('pro.add-recipe')"
          @click="addSheet = true"
        >
          <BaseIcon
            name="plus_circle"
            filled
            :size="28"
          />
        </button>
      </template>
    </BaseLargeTitle>
    <RecipeExplorerPage />
    <RecipeAddSheet v-model="addSheet" />
  </div>
</template>

<script setup lang="ts">
import RecipeExplorerPage from "~/components/Domain/Recipe/RecipeExplorerPage/RecipeExplorerPage.vue";
import RecipeAddSheet from "~/components/Domain/Recipe/RecipeAddSheet.vue";
import { useLoggedInState } from "~/composables/use-logged-in-state";

const { isOwnGroup } = useLoggedInState();
const addSheet = ref(false);
</script>

<style scoped>
.recipes-add {
  display: grid;
  place-items: center;
  border: 0;
  background: none;
  color: var(--pro-tint);
  cursor: pointer;
}
</style>
