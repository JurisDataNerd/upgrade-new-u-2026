<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import {
  PhX,
  PhCamera,
  PhQrCode,
  PhKeyboard,
  PhLightning,
  PhCheckCircle,
  PhWarningCircle,
} from '@phosphor-icons/vue';
import { soundEngine } from '@/lib/sound';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    subtitle?: string;
    presetTokens?: string[];
  }>(),
  {
    title: 'PEMINDAI KAMERA QR KAMPUS',
    subtitle: 'Arahkan kamera smartphone Anda tepat ke kode QR resmi GENIUS UNU 2026',
    presetTokens: () => [
      'UNU-PRESENSI-H1-GATE-2026',
      'UNU-PRESENSI-H1-CHECKOUT-2026',
      'UNU-PRESENSI-H2-GATE-2026',
      'UNU-PRESENSI-H2-CHECKOUT-2026',
      'UNU-PRESENSI-H3-GATE-2026',
      'UNU-PRESENSI-H3-CHECKOUT-2026',
    ],
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'scan', token: string): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const cameraStream = ref<MediaStream | null>(null);
const cameraError = ref<string | null>(null);
const isCameraActive = ref(false);
const manualInput = ref('');
const isScanningActive = ref(false);

let scanInterval: ReturnType<typeof setInterval> | null = null;

const closeModal = () => {
  stopCamera();
  emit('update:modelValue', false);
};

const handleTokenSubmitted = (token: string) => {
  if (!token || !token.trim()) return;
  soundEngine.playCorrect();
  emit('scan', token.trim());
  closeModal();
};

const startCamera = async () => {
  cameraError.value = null;
  isCameraActive.value = false;

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    cameraError.value = 'Peramban web tidak mendukung akses kamera langsung. Silakan gunakan input manual di bawah.';
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    cameraStream.value = stream;
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      videoRef.value.setAttribute('playsinline', 'true');
      await videoRef.value.play();
      isCameraActive.value = true;
      startBarcodeDetection();
    }
  } catch (err: any) {
    console.warn('[Camera] Gagal membuka kamera:', err);
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      cameraError.value = 'Izin akses kamera ditolak. Silakan izinkan kamera di setelan browser atau gunakan input manual.';
    } else {
      cameraError.value = 'Kamera tidak terdeteksi atau sedang digunakan aplikasi lain. Gunakan input manual.';
    }
  }
};

const stopCamera = () => {
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((track) => track.stop());
    cameraStream.value = null;
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
  isCameraActive.value = false;
};

// Deteksi otomatis jika peramban memiliki BarcodeDetector API natif
const startBarcodeDetection = () => {
  if (typeof window === 'undefined') return;

  const BarcodeDetectorAPI = (window as any).BarcodeDetector;
  if (!BarcodeDetectorAPI) {
    // BarcodeDetector belum didukung di peramban ini (fallback kamera aktif tapi manual / preset siap)
    return;
  }

  try {
    const detector = new BarcodeDetectorAPI({ formats: ['qr_code'] });
    scanInterval = setInterval(async () => {
      if (!videoRef.value || !isCameraActive.value) return;
      try {
        const barcodes = await detector.detect(videoRef.value);
        if (barcodes && barcodes.length > 0) {
          const rawValue = barcodes[0].rawValue;
          if (rawValue) {
            handleTokenSubmitted(rawValue);
          }
        }
      } catch {
        // Abaikan error per frame
      }
    }, 500);
  } catch (err) {
    console.warn('[BarcodeDetector] Error initializing detector:', err);
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      manualInput.value = '';
      startCamera();
    } else {
      stopCamera();
    }
  }
);

onMounted(() => {
  if (props.modelValue) {
    startCamera();
  }
});

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none"
  >
    <!-- Modal Dialog Body (Stardew / 2D Pixel RPG Theme) -->
    <div
      class="relative w-full max-w-md bg-[#1f140c] border-[3px] border-[#d97706] rounded-xl shadow-[0_0_25px_rgba(217,119,6,0.35),0_15px_30px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92dvh]"
    >
      <!-- Top RPG Header -->
      <div
        class="bg-[#2d1b0e] border-b-2 border-[#5a3a18] px-3.5 py-2.5 flex items-center justify-between shrink-0"
      >
        <div class="flex items-center gap-2">
          <div
            class="h-7 w-7 rounded bg-[#ca8a04]/20 border border-[#f59e0b] flex items-center justify-center text-[#facc15]"
          >
            <PhQrCode :size="16" weight="bold" />
          </div>
          <div>
            <h3 class="font-pixel text-[11px] sm:text-xs text-[#f0d060] font-bold leading-tight uppercase tracking-wider">
              {{ title }}
            </h3>
            <p class="font-sans text-[9px] text-[#c4956a] leading-none mt-0.5">
              GENIUS UNU 2026 • Scanner PWA
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="closeModal"
          class="h-7 w-7 rounded bg-[#3d2514] border border-[#784d24] text-[#e0b070] hover:text-white hover:border-[#f59e0b] flex items-center justify-center transition-all cursor-pointer active:scale-95"
          title="Tutup Pemindai"
        >
          <PhX :size="15" weight="bold" />
        </button>
      </div>

      <!-- Main Scanner Viewport Area -->
      <div class="p-3 sm:p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
        <!-- Subtitle Info -->
        <p class="font-sans text-[11px] text-[#d4b08c] text-center px-1">
          {{ subtitle }}
        </p>

        <!-- Camera Viewport Box with HUD Pixel Scanlines -->
        <div
          class="relative w-full h-52 sm:h-56 bg-black border-2 border-[#8b6f4e] rounded-lg overflow-hidden flex items-center justify-center shadow-inner group"
        >
          <!-- Live Video Feed -->
          <video
            ref="videoRef"
            class="w-full h-full object-cover"
            autoplay
            muted
            playsinline
          />

          <!-- Overlay 1: Pixel Scanline Effect (Moving vertical radar line) -->
          <div
            v-if="isCameraActive"
            class="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#4ade80] to-transparent shadow-[0_0_15px_#22c55e] animate-scanline z-10"
          />

          <!-- Overlay 2: HUD Reticle Corners (Pixel Target) -->
          <div class="pointer-events-none absolute inset-6 border border-emerald-500/30 rounded z-10">
            <!-- Top-Left Corner -->
            <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#4ade80]" />
            <!-- Top-Right Corner -->
            <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#4ade80]" />
            <!-- Bottom-Left Corner -->
            <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#4ade80]" />
            <!-- Bottom-Right Corner -->
            <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#4ade80]" />
          </div>

          <!-- Camera Inactive / Permission Denied State -->
          <div
            v-if="!isCameraActive"
            class="absolute inset-0 bg-[#160d07]/90 p-4 flex flex-col items-center justify-center text-center space-y-2 z-20"
          >
            <div
              class="h-10 w-10 rounded-full bg-[#3d2514] border border-[#ca8a04] flex items-center justify-center text-[#facc15]"
            >
              <PhCamera :size="20" weight="duotone" />
            </div>
            <p class="font-sans text-xs text-[#e8cbb0]">
              {{ cameraError || 'Menghubungkan ke lensa kamera smartphone...' }}
            </p>
            <button
              type="button"
              @click="startCamera"
              class="px-3 py-1 bg-[#3a7522] border border-[#78c850] text-[#f0f9e8] text-[10px] font-pixel rounded shadow hover:bg-[#48912b] transition-all"
            >
              Coba Nyalakan Kamera
            </button>
          </div>
        </div>

        <!-- Section: Manual Code Fallback -->
        <div class="bg-[#28180c] border border-[#614022] rounded-lg p-2.5 space-y-2">
          <div class="flex items-center gap-1.5 text-[10px] font-pixel text-[#f0d060]">
            <PhKeyboard :size="14" weight="bold" />
            <span>KODE MANUAL / CADANGAN</span>
          </div>

          <form @submit.prevent="handleTokenSubmitted(manualInput)" class="flex gap-1.5">
            <input
              v-model="manualInput"
              type="text"
              placeholder="Ketik kode (mis: UNU-PRESENSI-H1-GATE-2026)"
              class="flex-1 h-8 px-2.5 bg-[#170e07] border border-[#523e2b] rounded text-xs font-mono text-[#f0e0c0] placeholder-[#8b6f4e] focus:outline-none focus:border-[#f59e0b]"
            />
            <button
              type="submit"
              :disabled="!manualInput.trim()"
              class="h-8 px-3 bg-[#ca8a04] hover:bg-[#eab308] disabled:opacity-50 text-[#170e07] font-pixel text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow shrink-0"
            >
              <PhCheckCircle :size="14" weight="bold" />
              <span>SUBMIT</span>
            </button>
          </form>
        </div>

        <!-- Section: Quick Test Demo Presets (for instant testing without typing) -->
        <div v-if="presetTokens && presetTokens.length > 0" class="space-y-1.5 pt-1">
          <div class="flex items-center gap-1 text-[9px] font-pixel text-[#a08060] uppercase tracking-wider">
            <PhLightning :size="12" weight="fill" class="text-[#facc15]" />
            <span>Tombol Cepat Pengujian Demo:</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="tok in presetTokens"
              :key="tok"
              type="button"
              @click="handleTokenSubmitted(tok)"
              class="px-2 py-1 bg-[#24160c] hover:bg-[#3d2514] border border-[#5a3a18] hover:border-[#f59e0b] rounded text-[9px] font-mono text-[#e0c090] hover:text-[#facc15] transition-all flex items-center gap-1 cursor-pointer active:scale-95 text-left"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              <span>{{ tok }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Bottom Bar -->
      <div class="bg-[#190f08] border-t border-[#4a2e16] px-3.5 py-2 flex items-center justify-between text-[10px] font-mono text-[#a08060] shrink-0">
        <span>Sistem Anti-Titip Absen Aktif</span>
        <button
          type="button"
          @click="closeModal"
          class="hover:text-[#f0d060] underline text-[10px] cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes scanline {
  0% {
    top: 0%;
  }
  50% {
    top: 96%;
  }
  100% {
    top: 0%;
  }
}

.animate-scanline {
  animation: scanline 2.2s ease-in-out infinite;
}
</style>
