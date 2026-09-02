<script setup lang="ts">
interface Props {
  variant?: 'emerald' | 'gold' | 'amber' | 'cyan' | 'red' | 'wood' | 'slate';
  size?: 'sm' | 'md';
  pixelFont?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'emerald',
  size: 'md',
  pixelFont: true,
  className: '',
});

const variantStyles: Record<string, string> = {
  emerald: 'bg-[#14230f]/90 text-[#7ec850] border-[#7ec850] shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
  gold: 'bg-[#2a1c0d]/90 text-[#f0d060] border-[#f0d060] shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
  amber: 'bg-[#2a1c0d]/90 text-[#f0d060] border-[#d4af37] shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
  cyan: 'bg-[#0f1f2e]/90 text-[#60a8d8] border-[#60a8d8] shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
  red: 'bg-[#2d1210]/90 text-[#ff8080] border-[#d44040] shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
  wood: 'bg-[#281c12] text-[#c4956a] border-[#8b6f4e]',
  slate: 'bg-[#1e1713] text-[#a08060] border-[#5a3a18]',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[9px] rounded-full border',
  md: 'px-3 py-1 text-[10px] rounded-full border-1.5',
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 select-none uppercase font-bold tracking-wider',
      props.pixelFont ? 'font-pixel' : 'font-sans',
      variantStyles[props.variant] || variantStyles.emerald,
      sizeStyles[props.size] || sizeStyles.md,
      props.className
    ]"
  >
    <slot name="icon" />
    <slot />
  </span>
</template>
