<script setup lang="ts">
import { useGameStore } from '@/store/gameStore';
import { soundEngine } from '@/lib/sound';

interface Props {
  variant?: 'primary' | 'wood' | 'amber' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  pixelFont?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  pixelFont: true,
  disabled: false,
  className: '',
  type: 'button',
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const gameStore = useGameStore();

const handleClick = (e: MouseEvent) => {
  if (props.disabled) return;
  if (gameStore.soundEnabled) {
    soundEngine.playClick();
  }
  emit('click', e);
};

const variantClass: Record<string, string> = {
  primary: 'rpg-btn-primary',
  wood: 'rpg-btn-wood',
  amber: 'rpg-btn-wood',
  secondary: 'rpg-btn-wood',
  danger: 'rpg-btn-danger',
  ghost:
    'bg-[#3d2b1e]/80 text-[#f0e0c0] border-2 border-[#5a3a18] hover:bg-[#4d3b2e] hover:border-[#f0d060] active:translate-y-0.5 rounded-lg',
};

const sizeClass: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-xs sm:text-sm',
  lg: 'px-6 py-3.5 text-xs sm:text-sm',
};
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    @click="handleClick"
    :class="[
      'inline-flex items-center justify-center gap-2.5 font-bold select-none text-center',
      props.pixelFont ? 'font-pixel tracking-wide' : 'font-sans font-semibold',
      variantClass[props.variant] || variantClass.primary,
      sizeClass[props.size] || sizeClass.md,
      props.disabled
        ? 'opacity-40 cursor-not-allowed filter grayscale active:transform-none pointer-events-none'
        : 'cursor-pointer',
      props.className
    ]"
  >
    <slot name="icon" />
    <slot />
  </button>
</template>
