<template>
  <AvatarImage
    :src="props.src || ''"
    :alt="props.alt"
    :class="cn('aspect-square h-full w-full object-cover', props.class)"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { AvatarImage } from "radix-vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  src?: string;
  alt?: string;
  class?: HTMLAttributes["class"];
}>();
</script>
