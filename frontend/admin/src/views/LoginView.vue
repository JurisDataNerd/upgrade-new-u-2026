<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '../store/adminStore';
import { PhShieldCheck, PhLockKey, PhArrowRight } from '@phosphor-icons/vue';

const router = useRouter();
const store = useAdminStore();

const passcode = ref('');
const errorMessage = ref('');

const handleLogin = () => {
  if (!passcode.value) {
    errorMessage.value = 'Silakan masukkan passcode admin';
    return;
  }

  const success = store.login(passcode.value);
  if (success) {
    router.push('/');
  } else {
    errorMessage.value = 'Passcode tidak valid. Gunakan: unu2026';
  }
};
</script>

<template>
  <div class="min-h-[100dvh] flex items-center justify-center bg-slate-900 p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-800/20 p-8 space-y-6">
      <!-- Logo & Header -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto">
          <PhShieldCheck :size="28" weight="bold" />
        </div>
        <h1 class="text-xl font-bold text-slate-900 tracking-tight">Admin & Panitia PKKMB</h1>
        <p class="text-xs text-slate-500">GENIUS UNU Yogyakarta 2026</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Passcode Panitia
          </label>
          <div class="relative">
            <PhLockKey :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="passcode"
              type="password"
              placeholder="Masukkan passcode..."
              class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Passcode default demo: <code class="font-mono text-teal-700 font-bold">unu2026</code></p>
        </div>

        <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-200/80 rounded-lg text-xs text-rose-600 font-medium">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          class="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-600/30"
        >
          <span>Masuk ke Dashboard</span>
          <PhArrowRight :size="16" weight="bold" />
        </button>
      </form>
    </div>
  </div>
</template>
