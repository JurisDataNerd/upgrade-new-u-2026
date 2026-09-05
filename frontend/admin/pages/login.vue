<template>
  <div class="w-full max-w-md mx-auto space-y-4 text-[#f0e0c0]">
    <!-- Branding Header -->
    <div class="text-center space-y-2">
      <!-- Top Branding Pill -->
      <div class="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#1e140c]/90 border border-[#f0d060]/50 shadow-md backdrop-blur">
        <img
          src="/unu.png"
          alt="UNU Yogyakarta"
          class="h-6 w-auto object-contain filter drop-shadow"
        />
        <div class="w-[1px] h-4 bg-[#f0d060]/40" />
        <span class="font-pixel text-[9px] text-[#f0d060] uppercase tracking-wider font-bold">
          UNU YOGYAKARTA
        </span>
      </div>

      <!-- Main Title -->
      <div>
        <h1 class="font-pixel text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-[#fef08a] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          GENIUS UNU 2026
        </h1>
        <p class="font-sans text-xs sm:text-sm text-[#86efac] font-medium mt-1">
          Pusat Kendali Panitia Superadmin &amp; Game Master Buddy
        </p>
      </div>
    </div>

    <!-- Login Card -->
    <div class="sdv-card-gold p-4 sm:p-6 space-y-4">
      <!-- Header Card -->
      <div class="flex items-center justify-between border-b border-[#5a3a18] pb-2.5">
        <div class="flex items-center gap-2.5">
          <div class="h-9 w-9 rounded-lg bg-[#271d15] border-2 border-[#f0d060] flex items-center justify-center font-pixel text-[#facc15] shadow">
            <Crown class="h-5 w-5" />
          </div>
          <div>
            <h2 class="font-pixel text-xs sm:text-sm font-bold text-[#fef08a] uppercase">
              PORTAL MASUK
            </h2>
            <span class="text-[10px] text-[#c4956a] font-mono">Masukkan kredensial panitia atau buddy</span>
          </div>
        </div>
      </div>

      <!-- Error Message Box -->
      <div
        v-if="errorMsg"
        class="border-2 border-[#d44040] bg-[#2a1210] p-2.5 rounded-lg text-xs font-mono text-[#fca5a5] flex items-start gap-2 shadow"
      >
        <AlertTriangle class="h-4 w-4 shrink-0 text-[#f87171] mt-0.5" />
        <div>
          <div class="font-pixel text-[8.5px] font-bold uppercase text-[#fca5a5]">AKSES DITOLAK</div>
          <div class="text-[10.5px] mt-0.5">{{ errorMsg }}</div>
        </div>
      </div>

      <!-- Manual Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-3 font-mono text-xs">
        <div class="space-y-1">
          <label for="username" class="text-[10px] font-semibold text-[#f0e0c0] flex items-center justify-between">
            <span class="font-pixel text-[8.5px]">USERNAME:</span>
            <span class="text-[8.5px] text-[#c4956a]">admin / buddy01 / buddy03</span>
          </label>
          <div class="relative">
            <User class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#f0d060]" />
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="admin atau buddy01"
              required
              autocomplete="username"
              :disabled="auth.loading.value"
              class="w-full h-9 pl-9 pr-3 bg-[#170f07] border-2 border-[#5a3a18] focus:border-[#f0d060] rounded-lg text-white text-xs font-mono outline-none"
            />
          </div>
        </div>

        <div class="space-y-1">
          <label for="password" class="text-[10px] font-semibold text-[#f0e0c0] flex items-center justify-between">
            <span class="font-pixel text-[8.5px]">KATA SANDI:</span>
            <span class="text-[8.5px] text-[#c4956a]">admin2026 / buddy2026</span>
          </label>
          <div class="relative">
            <Key class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#f0d060]" />
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              autocomplete="current-password"
              :disabled="auth.loading.value"
              class="w-full h-9 pl-9 pr-3 bg-[#170f07] border-2 border-[#5a3a18] focus:border-[#f0d060] rounded-lg text-white text-xs font-mono outline-none"
            />
          </div>
        </div>

        <!-- Arcade Stardew RPG Button -->
        <button
          type="submit"
          class="rpg-btn-primary w-full h-10 font-pixel text-xs font-bold flex items-center justify-center gap-2 mt-3 cursor-pointer"
          :disabled="auth.loading.value"
        >
          <RotateCw v-if="auth.loading.value" class="h-4 w-4 animate-spin text-white" />
          <span v-if="auth.loading.value">MEMVERIFIKASI...</span>
          <span v-else>MASUK KE PORTAL ▶</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { User, Key, RotateCw, AlertTriangle, Crown } from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";

definePageMeta({
  layout: "auth",
});

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
}
</script>
