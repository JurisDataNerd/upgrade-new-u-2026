<template>
  <component
    :is="asChild ? 'slot' : 'a'"
    :class="cn('transition-colors hover:text-foreground', props.class)"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  asChild?: boolean;
  class?: HTMLAttributes["class"];
}>();
</script>
