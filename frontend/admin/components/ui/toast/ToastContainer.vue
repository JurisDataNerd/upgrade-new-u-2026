<template>
  <div class="fixed top-4 right-4 z-[99999] w-[90vw] max-w-sm space-y-2.5 pointer-events-none">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto p-3.5 rounded-xl border-2 shadow-2xl backdrop-blur-md transition-all text-white relative overflow-hidden"
      :class="getToastClasses(toast.type)"
    >
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div
          class="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center border text-sm font-bold"
          :class="getIconContainerClasses(toast.type)"
        >
          <Radio v-if="toast.type === 'BROADCAST'" class="h-4 w-4 animate-pulse text-amber-400" />
          <CheckCircle2 v-else-if="toast.type === 'SUCCESS'" class="h-4 w-4 text-emerald-400" />
          <AlertOctagon v-else-if="toast.type === 'ERROR'" class="h-4 w-4 text-red-400" />
          <AlertTriangle v-else-if="toast.type === 'WARNING'" class="h-4 w-4 text-amber-400" />
          <Info v-else class="h-4 w-4 text-cyan-400" />
        </div>

        <!-- Content -->
        <div class="min-w-0 flex-1 space-y-0.5 font-mono">
          <div class="flex items-center justify-between gap-1">
            <h4 class="font-pixel text-xs font-bold" :class="getTitleColor(toast.type)">
              {{ toast.type === 'BROADCAST' ? '📢 ' : '' }}{{ toast.title }}
            </h4>
            <button
              @click="remove(toast.id)"
              class="text-gray-400 hover:text-white p-0.5 -mr-1 -mt-1"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </div>
          <p class="text-[11px] text-gray-200 leading-snug">
            {{ toast.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Radio,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
  X,
} from "lucide-vue-next";
import { useToast } from "@/composables/useToast";

const { toasts, remove } = useToast();

function getToastClasses(type: string) {
  switch (type) {
    case "BROADCAST":
      return "border-amber-400 bg-gradient-to-br from-[#2a1d0b] to-[#120d05] shadow-[0_0_20px_rgba(245,158,11,0.25)]";
    case "SUCCESS":
      return "border-emerald-500 bg-gradient-to-br from-[#0c2417] to-[#04120b] shadow-[0_0_20px_rgba(16,185,129,0.2)]";
    case "ERROR":
      return "border-red-500 bg-gradient-to-br from-[#2b0c0f] to-[#140406] shadow-[0_0_20px_rgba(239,68,68,0.2)]";
    case "WARNING":
      return "border-amber-500 bg-gradient-to-br from-[#291b09] to-[#140d04] shadow-[0_0_20px_rgba(245,158,11,0.2)]";
    case "INFO":
    default:
      return "border-cyan-500 bg-gradient-to-br from-[#0c1f2e] to-[#040e17] shadow-[0_0_20px_rgba(6,182,212,0.2)]";
  }
}

function getIconContainerClasses(type: string) {
  switch (type) {
    case "BROADCAST":
      return "border-amber-400/60 bg-amber-950/60 text-amber-400";
    case "SUCCESS":
      return "border-emerald-500/60 bg-emerald-950/60 text-emerald-400";
    case "ERROR":
      return "border-red-500/60 bg-red-950/60 text-red-400";
    case "WARNING":
      return "border-amber-500/60 bg-amber-950/60 text-amber-400";
    case "INFO":
    default:
      return "border-cyan-500/60 bg-cyan-950/60 text-cyan-400";
  }
}

function getTitleColor(type: string) {
  switch (type) {
    case "BROADCAST":
      return "text-amber-300";
    case "SUCCESS":
      return "text-emerald-300";
    case "ERROR":
      return "text-red-300";
    case "WARNING":
      return "text-amber-300";
    case "INFO":
    default:
      return "text-cyan-300";
  }
}
</script>
