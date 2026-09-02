<template>
  <footer class="sticky bottom-0 z-30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 md:px-6 py-2.5 bg-[#140e0a]/95 border-t-2 border-[#4a3624] backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.8)] text-xs font-mono w-full mt-auto shrink-0 select-none">
    <!-- Info & Page Size Selector -->
    <div class="flex items-center gap-3 text-muted-foreground text-[11px]">
      <div class="flex items-center gap-1.5">
        <span class="text-[#f59e0b] font-pixel text-[10px]">▶</span>
        <span>
          Menampilkan <strong class="text-foreground font-bold">{{ startItem }} - {{ endItem }}</strong> dari <strong class="text-[#f59e0b] font-bold">{{ totalItems }}</strong> data
        </span>
      </div>

      <div class="flex items-center gap-1.5 border-l border-[#4a3624] pl-3">
        <span class="text-[10px] text-muted-foreground">Baris:</span>
        <select
          :value="pageSize"
          @change="$emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))"
          class="h-6 bg-[#271d15] border border-[#523e2b] px-1.5 text-[11px] text-[#facc15] font-bold focus:outline-none focus:border-[#f59e0b] rounded-none cursor-pointer"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
            {{ opt }} / hal
          </option>
        </select>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex items-center gap-1 self-end sm:self-auto">
      <!-- First Page -->
      <button
        :disabled="currentPage <= 1"
        @click="$emit('update:currentPage', 1)"
        class="h-7 px-2 bg-[#271d15] border border-[#523e2b] text-foreground hover:bg-[#3d2d1e] hover:border-[#f59e0b] disabled:opacity-40 disabled:pointer-events-none text-[10px] font-pixel transition-colors"
        title="Halaman Pertama"
      >
        ⏮
      </button>

      <!-- Previous -->
      <button
        :disabled="currentPage <= 1"
        @click="$emit('update:currentPage', currentPage - 1)"
        class="h-7 px-2.5 bg-[#271d15] border border-[#523e2b] text-foreground hover:bg-[#3d2d1e] hover:border-[#f59e0b] disabled:opacity-40 disabled:pointer-events-none text-[10px] font-pixel flex items-center gap-1 transition-colors"
      >
        <span>◀</span>
        <span class="hidden sm:inline">PREV</span>
      </button>

      <!-- Page Number Blocks -->
      <div class="flex items-center gap-1 px-1">
        <button
          v-for="p in visiblePages"
          :key="p"
          @click="typeof p === 'number' && $emit('update:currentPage', p)"
          :disabled="typeof p !== 'number'"
          :class="[
            'h-7 min-w-[28px] px-1.5 text-xs font-mono font-bold transition-all border',
            p === currentPage
              ? 'bg-[#f59e0b] border-[#f59e0b] text-[#16110d] shadow-sm font-pixel text-[11px]'
              : typeof p === 'number'
                ? 'bg-[#271d15] border-[#523e2b] text-foreground hover:bg-[#3d2d1e] hover:border-[#f59e0b]'
                : 'bg-transparent border-transparent text-muted-foreground cursor-default'
          ]"
        >
          {{ p }}
        </button>
      </div>

      <!-- Next -->
      <button
        :disabled="currentPage >= totalPages"
        @click="$emit('update:currentPage', currentPage + 1)"
        class="h-7 px-2.5 bg-[#271d15] border border-[#523e2b] text-foreground hover:bg-[#3d2d1e] hover:border-[#f59e0b] disabled:opacity-40 disabled:pointer-events-none text-[10px] font-pixel flex items-center gap-1 transition-colors"
      >
        <span class="hidden sm:inline">NEXT</span>
        <span>▶</span>
      </button>

      <!-- Last Page -->
      <button
        :disabled="currentPage >= totalPages"
        @click="$emit('update:currentPage', totalPages)"
        class="h-7 px-2 bg-[#271d15] border border-[#523e2b] text-foreground hover:bg-[#3d2d1e] hover:border-[#f59e0b] disabled:opacity-40 disabled:pointer-events-none text-[10px] font-pixel transition-colors"
        title="Halaman Terakhir"
      >
        ⏭
      </button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    currentPage: number;
    totalItems: number;
    pageSize?: number;
    pageSizeOptions?: number[];
  }>(),
  {
    pageSize: 10,
    pageSizeOptions: () => [10, 25, 50, 100],
  }
);

defineEmits<{
  (e: "update:currentPage", page: number): void;
  (e: "update:pageSize", size: number): void;
}>();

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.totalItems / props.pageSize));
});

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.totalItems);
});

const visiblePages = computed(() => {
  const current = props.currentPage;
  const total = totalPages.value;
  const delta = 1;

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range: (number | string)[] = [];
  const left = current - delta;
  const right = current + delta + 1;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= left && i < right)) {
      range.push(i);
    }
  }

  const withEllipsis: (number | string)[] = [];
  let prev: number | null = null;

  for (const page of range) {
    if (typeof page === "number") {
      if (prev !== null) {
        if (page - prev === 2) {
          withEllipsis.push(prev + 1);
        } else if (page - prev > 2) {
          withEllipsis.push("...");
        }
      }
      withEllipsis.push(page);
      prev = page;
    }
  }

  return withEllipsis;
});
</script>
