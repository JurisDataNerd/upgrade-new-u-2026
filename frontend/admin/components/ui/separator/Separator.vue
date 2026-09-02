<template>
  <Separator
    :class="
      cn(
        'shrink-0 bg-border',
        props.orientation === 'vertical' ? 'h-full w-[1px]' : 'h-[1px] w-full',
        props.class
      )
    "
    v-bind="props"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Separator, type SeparatorProps } from "radix-vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<SeparatorProps & { class?: HTMLAttributes["class"] }>(),
  {
    orientation: "horizontal",
    decorative: true,
  }
);
</script>
