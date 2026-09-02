<template>
  <AvatarFallback
    :class="
      cn(
        'flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary',
        props.class
      )
    "
  >
    <slot />
  </AvatarFallback>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { AvatarFallback } from "radix-vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>
