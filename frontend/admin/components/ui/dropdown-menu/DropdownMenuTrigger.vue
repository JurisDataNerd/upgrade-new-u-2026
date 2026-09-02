<template>
  <DropdownMenuTrigger v-bind="props" :class="cn('outline-none', props.class)">
    <slot />
  </DropdownMenuTrigger>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { DropdownMenuTrigger, type DropdownMenuTriggerProps } from "radix-vue";
import { cn } from "@/lib/utils";

const props = defineProps<
  DropdownMenuTriggerProps & { class?: HTMLAttributes["class"] }
>();
</script>
