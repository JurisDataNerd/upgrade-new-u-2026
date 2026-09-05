<template>
  <div class="fixed top-16 right-5 z-[999999] w-[92vw] max-w-sm pointer-events-none">
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="transform translate-y-[-12px] opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-x-10 opacity-0 scale-90"
      move-class="transition-all duration-300 ease"
      tag="div"
      class="space-y-2.5"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto p-3.5 rounded-xl border-2 shadow-2xl backdrop-blur-md text-white relative overflow-hidden transition-all group"
        :class="getToastClasses(toast.type)"
      >
        <div class="flex items-start gap-3">
          <!-- Icon Badge -->
          <div
            class="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center border text-sm font-bold shadow-md"
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
              <h4 class="font-pixel text-[11px] font-bold tracking-wider" :class="getTitleColor(toast.type)">
                {{ toast.type === 'BROADCAST' ? '📢 ' : '' }}{{ toast.title }}
              </h4>
              <button
                @click="remove(toast.id)"
                class="text-gray-400 hover:text-white p-0.5 -mr-1 -mt-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Notifikasi"
              >
                <X class="h-3.5 w-3.5" />
              </button>
            </div>
            <p v-if="toast.message" class="text-[11px] text-gray-200 leading-snug break-words">
              {{ toast.message }}
            </p>
          </div>
        </div>

        <!-- Subtle Top Accent Line -->
        <div
          class="absolute top-0 left-0 right-0 h-[2px] opacity-80"
          :class="getAccentLineClass(toast.type)"
        />
      </div>
    </TransitionGroup>
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
      return "border-amber-400 bg-gradient-to-br from-[#2a1d0b]/95 to-[#120d05]/95 shadow-[0_0_25px_rgba(245,158,11,0.3)]";
    case "SUCCESS":
      return "border-emerald-500 bg-gradient-to-br from-[#0c2417]/95 to-[#04120b]/95 shadow-[0_0_25px_rgba(16,185,129,0.25)]";
    case "ERROR":
      return "border-red-500 bg-gradient-to-br from-[#2b0c0f]/95 to-[#140406]/95 shadow-[0_0_25px_rgba(239,68,68,0.25)]";
    case "WARNING":
      return "border-amber-500 bg-gradient-to-br from-[#291b09]/95 to-[#140d04]/95 shadow-[0_0_25px_rgba(245,158,11,0.25)]";
    case "INFO":
    default:
      return "border-cyan-500 bg-gradient-to-br from-[#0c1f2e]/95 to-[#040e17]/95 shadow-[0_0_25px_rgba(6,182,212,0.25)]";
  }
}

function getIconContainerClasses(type: string) {
  switch (type) {
    case "BROADCAST":
      return "border-amber-400/60 bg-amber-950/80 text-amber-400";
    case "SUCCESS":
      return "border-emerald-500/60 bg-emerald-950/80 text-emerald-400";
    case "ERROR":
      return "border-red-500/60 bg-red-950/80 text-red-400";
    case "WARNING":
      return "border-amber-500/60 bg-amber-950/80 text-amber-400";
    case "INFO":
    default:
      return "border-cyan-500/60 bg-cyan-950/80 text-cyan-400";
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

function getAccentLineClass(type: string) {
  switch (type) {
    case "BROADCAST":
      return "bg-amber-400";
    case "SUCCESS":
      return "bg-emerald-400";
    case "ERROR":
      return "bg-red-400";
    case "WARNING":
      return "bg-amber-400";
    case "INFO":
    default:
      return "bg-cyan-400";
  }
}
</script>
