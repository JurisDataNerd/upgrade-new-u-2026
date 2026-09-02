<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: 'emerald' | 'gold' | 'amber' | 'cyan';
  height?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  color: 'emerald',
  height: 'md',
  showPercentage: true,
  className: '',
});

const percentage = computed(() => {
  return Math.min(100, Math.max(0, Math.round((props.value / props.max) * 100)));
});

const barColor: Record<string, string> = {
  emerald: 'bg-gradient-to-r from-[#4a8030] to-[#7ec850]',
  gold: 'bg-gradient-to-r from-[#c4a030] to-[#f0d060]',
  amber: 'bg-gradient-to-r from-[#b45309] to-[#f59e0b]',
  cyan: 'bg-gradient-to-r from-[#164e63] to-[#06b6d4]',
};

const heightClass: Record<string, string> = {
  sm: 'h-2.5',
  md: 'h-4',
  lg: 'h-6',
};
</script>

<template>
  <div :class="['w-full', props.className]">
    <div v-if="props.label || props.showPercentage" class="flex items-center justify-between gap-2 mb-1.5 text-xs font-pixel flex-wrap">
      <span class="text-[#a08060] flex items-center gap-1.5 text-[10px] break-words">
        {{ props.label }}
        <span v-if="props.sublabel" class="text-[#c4956a] font-sans text-[11px] font-normal">
          ({{ props.sublabel }})
        </span>
      </span>
      <span v-if="props.showPercentage" class="text-[#f0d060] font-bold shrink-0 text-[10px]">
        {{ percentage }}%
      </span>
    </div>

    <!-- Outer RPG Wood Container -->
    <div class="w-full bg-[#170f07] p-1 border-2 border-[#5a3a18] rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
      <div :class="['w-full bg-[#23160c] rounded overflow-hidden relative', heightClass[props.height] || heightClass.md]">
        <!-- Fill Bar -->
        <div
          :class="['h-full transition-all duration-500 ease-out border-r border-[#f0d060] relative', barColor[props.color] || barColor.emerald]"
          :style="{ width: `${percentage}%` }"
        >
          <div
            class="absolute inset-0 opacity-20"
            style="background-image: repeating-linear-gradient(45deg, transparent, transparent 6px, #000 6px, #000 12px);"
          />
        </div>
      </div>
    </div>
  </div>
</template>
