<template>
  <ClientOnly>
    <Teleport to="#topbar-actions" v-if="isMounted">
      <div class="flex items-center gap-2">
        <slot />
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});
</script>
