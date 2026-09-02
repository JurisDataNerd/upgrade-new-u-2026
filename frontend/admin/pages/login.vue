<template>
  <div class="pixel-card-gold p-6 space-y-5">
    <!-- Game Logo & Header Title -->
    <div class="text-center space-y-2">
      <!-- Pixel Crown / Shield Badge -->
      <div class="mx-auto flex h-12 w-12 items-center justify-center border-2 border-[#ca8a04] bg-[#2b2014] text-xl font-pixel text-[#facc15] shadow-md animate-pulse">
        👑
      </div>

      <div>
        <div class="font-pixel text-lg sm:text-xl font-bold tracking-widest text-[#f59e0b]">
          GENIUS 2026
        </div>
        <div class="font-pixel text-[10px] text-[#facc15] tracking-wider mt-0.5">
          UPGRADE NEW YOU
        </div>
      </div>

      <div class="inline-flex items-center gap-1.5 border border-[#4a3624] bg-[#15100c] px-2 py-0.5 text-[9px] font-mono text-muted-foreground">
        <span>UNU YOGYAKARTA</span>
        <span>•</span>
        <span class="text-[#38bdf8]">ADMIN CONTROL CENTER</span>
      </div>
    </div>

    <!-- Error Message Box (Pixel Theme) -->
    <div
      v-if="errorMsg"
      class="border-2 border-[#dc2626] bg-[#2a1414] p-3 text-xs font-mono text-[#f87171] flex items-start gap-2 shadow-[0_0_10px_rgba(220,38,38,0.2)]"
    >
      <AlertTriangle class="h-4 w-4 shrink-0 text-[#f87171] mt-0.5" />
      <div>
        <div class="font-pixel text-[10px] font-bold uppercase">AKSES DITOLAK</div>
        <div class="text-[11px] mt-0.5">{{ errorMsg }}</div>
      </div>
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="space-y-4 font-mono text-xs">
      <div class="space-y-1.5">
        <label for="username" class="text-xs font-semibold text-foreground flex items-center justify-between">
          <span>USERNAME ADMIN:</span>
          <span class="text-[10px] text-muted-foreground font-normal">Identitas Akun</span>
        </label>
        <div class="relative">
          <User class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#f59e0b]" />
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="admin"
            required
            autocomplete="username"
            :disabled="auth.loading.value"
            class="w-full h-9 pl-9 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b] text-xs font-mono placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <label for="password" class="text-xs font-semibold text-foreground flex items-center justify-between">
          <span>KATA SANDI:</span>
          <span class="text-[10px] text-muted-foreground font-normal">Kunci Akses</span>
        </label>
        <div class="relative">
          <Key class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#f59e0b]" />
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
            :disabled="auth.loading.value"
            class="w-full h-9 pl-9 pr-3 bg-[#1d1611] border border-[#523e2b] text-foreground focus:outline-none focus:border-[#f59e0b] text-xs font-mono placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      <!-- Arcade 3D Submit Button -->
      <button
        type="submit"
        class="pixel-btn w-full h-9 bg-[#ca8a04] text-[#16110d] border-[#eab308] font-pixel text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#eab308] mt-2 transition-transform"
        :disabled="auth.loading.value"
      >
        <RotateCw v-if="auth.loading.value" class="h-4 w-4 animate-spin text-[#16110d]" />
        <span v-if="auth.loading.value">MEMVERIFIKASI...</span>
        <span v-else>MASUK KE CONTROL CENTER ▶</span>
      </button>
    </form>

    <!-- Default Credentials Hint Card -->
    <div class="border-t border-[#4a3624] pt-3 text-center font-mono text-[11px] text-muted-foreground space-y-1">
      <div>Akun Default Sistem:</div>
      <div class="flex items-center justify-center gap-2">
        <span class="border border-[#ca8a04]/60 bg-[#2b2014] px-1.5 py-0.5 text-[10px] font-pixel text-[#facc15]">
          admin
        </span>
        <span>/</span>
        <span class="border border-[#ca8a04]/60 bg-[#2b2014] px-1.5 py-0.5 text-[10px] font-pixel text-[#facc15]">
          admin2026
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { User, Key, RotateCw, AlertTriangle } from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const auth = useAuth();

const username = ref("");
const password = ref("");
const errorMsg = ref("");

async function handleLogin() {
  errorMsg.value = "";
  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = "Mohon isi username dan password.";
    return;
  }

  const res = await auth.login(username.value.trim(), password.value);
  if (!res.success) {
    errorMsg.value = res.error || "Gagal masuk. Periksa kembali kredensial Anda.";
    return;
  }

  const redirect = (route.query.redirect as string) || "/";
  navigateTo(redirect);
}
</script>
