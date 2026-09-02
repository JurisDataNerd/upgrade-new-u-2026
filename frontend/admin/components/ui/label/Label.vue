<template>
  <Label
    :class="
      cn(
        'text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.class
      )
    "
    v-bind="props"
  >
    <slot />
  </Label>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Label, type LabelProps } from "radix-vue";
import { cn } from "@/lib/utils";

const props = defineProps<LabelProps & { class?: HTMLAttributes["class"] }>();
</script>
