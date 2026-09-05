<template>
  <Dialog :open="modelOpen" @update:open="onOpenChange">
    <DialogContent
      class="!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !z-[99999] w-[calc(100%-2rem)] max-w-md border-2 border-[#ca8a04] bg-[#1a120c] p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] text-[#f0e0c0] pixel-card-gold"
    >
      <!-- Modal Inner Container -->
      <div class="space-y-4">
        <!-- Top Visual Badge + Title -->
        <div class="flex items-start gap-3.5">
          <!-- Icon Badge -->
          <div
            class="h-11 w-11 shrink-0 rounded-lg flex items-center justify-center border-2 text-base shadow-lg transition-transform"
            :class="badgeClasses"
          >
            <!-- Logout Icon -->
            <LogOut v-if="activeIcon === 'logout'" class="h-5 w-5 animate-pulse" />
            <!-- Trash Icon -->
            <Trash2 v-else-if="activeIcon === 'trash'" class="h-5 w-5" />
            <!-- Shield Icon -->
            <ShieldAlert v-else-if="activeIcon === 'shield'" class="h-5 w-5" />
            <!-- Info Icon -->
            <Info v-else-if="activeIcon === 'info'" class="h-5 w-5" />
            <!-- Check Icon -->
            <CheckCircle2 v-else-if="activeIcon === 'check'" class="h-5 w-5" />
            <!-- Default Alert Triangle -->
            <AlertTriangle v-else class="h-5 w-5" />
          </div>

          <!-- Title & Sub-badge -->
          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="px-1.5 py-0.2 font-pixel text-[9px] border uppercase rounded"
                :class="tagClasses"
              >
                {{ tagLabel }}
              </span>
            </div>
            <DialogTitle class="font-pixel text-xs sm:text-sm text-[#facc15] uppercase tracking-wider leading-snug">
              {{ activeTitle }}
            </DialogTitle>
          </div>
        </div>

        <!-- Description -->
        <DialogDescription class="font-mono text-xs text-gray-300 leading-relaxed bg-[#120d08] border border-[#4a3624] p-3 rounded">
          {{ activeDescription }}
        </DialogDescription>

        <!-- Footer Buttons -->
        <DialogFooter class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-[#4a3624]">
          <button
            type="button"
            @click="onCancel"
            class="pixel-btn h-8.5 px-4 text-xs font-pixel bg-[#271d15] text-gray-300 border-[#523e2b] hover:bg-[#3d2d1e] hover:text-white cursor-pointer transition-all flex items-center justify-center"
          >
            {{ activeCancelText }}
          </button>

          <button
            type="button"
            :disabled="activeLoading"
            @click="onConfirm"
            class="pixel-btn h-8.5 px-5 text-xs font-pixel font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            :class="confirmBtnClasses"
          >
            <RotateCw v-if="activeLoading" class="h-3.5 w-3.5 animate-spin" />
            <span>{{ activeConfirmText }}</span>
          </button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  LogOut,
  AlertTriangle,
  Trash2,
  ShieldAlert,
  Info,
  CheckCircle2,
  RotateCw,
} from "lucide-vue-next";
import { useConfirm } from "@/composables/useConfirm";

interface Props {
  open?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "primary";
  icon?: "logout" | "alert" | "trash" | "shield" | "info" | "check";
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  title: undefined,
  description: undefined,
  confirmText: undefined,
  cancelText: undefined,
  variant: undefined,
  icon: undefined,
  loading: undefined,
});

const emit = defineEmits<{
  (e: "update:open", val: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const globalConfirm = useConfirm();

// Resolve controlled vs global composable state
const modelOpen = computed(() => {
  return props.open !== undefined ? props.open : globalConfirm.isOpen.value;
});

const activeTitle = computed(() => {
  return props.title ?? globalConfirm.options.value.title;
});

const activeDescription = computed(() => {
  return props.description ?? globalConfirm.options.value.description;
});

const activeConfirmText = computed(() => {
  return props.confirmText ?? globalConfirm.options.value.confirmText ?? "Konfirmasi";
});

const activeCancelText = computed(() => {
  return props.cancelText ?? globalConfirm.options.value.cancelText ?? "Batal";
});

const activeVariant = computed(() => {
  return props.variant ?? globalConfirm.options.value.variant ?? "primary";
});

const activeIcon = computed(() => {
  return props.icon ?? globalConfirm.options.value.icon ?? "alert";
});

const activeLoading = computed(() => {
  return props.loading ?? globalConfirm.options.value.loading ?? false;
});

// UI helpers
const badgeClasses = computed(() => {
  switch (activeVariant.value) {
    case "danger":
      return "border-red-500 bg-gradient-to-br from-red-950/80 to-[#1e0708] text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.35)]";
    case "warning":
      return "border-amber-500 bg-gradient-to-br from-amber-950/80 to-[#1e1305] text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]";
    case "info":
      return "border-cyan-500 bg-gradient-to-br from-cyan-950/80 to-[#071822] text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]";
    case "primary":
    default:
      return "border-emerald-500 bg-gradient-to-br from-emerald-950/80 to-[#081f12] text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]";
  }
});

const tagClasses = computed(() => {
  switch (activeVariant.value) {
    case "danger":
      return "border-red-600 bg-[#351616] text-red-300";
    case "warning":
      return "border-amber-600 bg-[#352514] text-amber-300";
    case "info":
      return "border-cyan-600 bg-[#122835] text-cyan-300";
    case "primary":
    default:
      return "border-emerald-600 bg-[#16351b] text-emerald-300";
  }
});

const tagLabel = computed(() => {
  if (activeIcon.value === "logout") return "Sesi Keluar";
  switch (activeVariant.value) {
    case "danger":
      return "Peringatan";
    case "warning":
      return "Perhatian";
    case "info":
      return "Informasi";
    case "primary":
    default:
      return "Konfirmasi";
  }
});

const confirmBtnClasses = computed(() => {
  switch (activeVariant.value) {
    case "danger":
      return "bg-[#dc2626] text-white border-[#f87171] hover:bg-[#b91c1c] shadow-[0_0_12px_rgba(239,68,68,0.4)]";
    case "warning":
      return "bg-[#d97706] text-white border-[#fbbf24] hover:bg-[#b45309] shadow-[0_0_12px_rgba(217,119,6,0.4)]";
    case "info":
      return "bg-[#0284c7] text-white border-[#38bdf8] hover:bg-[#0369a1] shadow-[0_0_12px_rgba(2,132,199,0.4)]";
    case "primary":
    default:
      return "bg-[#16a34a] text-white border-[#4ade80] hover:bg-[#15803d] shadow-[0_0_12px_rgba(22,163,74,0.4)]";
  }
});

function onConfirm() {
  if (props.open !== undefined) {
    emit("confirm");
  } else {
    globalConfirm.handleConfirm();
  }
}

function onCancel() {
  if (props.open !== undefined) {
    emit("cancel");
    emit("update:open", false);
  } else {
    globalConfirm.handleCancel();
  }
}

function onOpenChange(val: boolean) {
  if (!val) {
    onCancel();
  }
}
</script>
