<template>
  <!-- Buddy Mobile-First Dedicated Layout (Pixel Stardew Valley Theme) -->
  <div
    v-if="isBuddyView"
    class="min-h-[100dvh] bg-[#2d1b0e] text-[#f0e0c0] flex flex-col font-sans selection:bg-[#f0d060] selection:text-[#2d1b0e]"
  >
    <BuddyHeader />
    <main class="flex-1 w-full max-w-xl mx-auto pb-24 custom-scrollbar flex flex-col min-h-0 px-3 pt-3">
      <slot />
    </main>
    <BuddyBottomNav />
    <ToastContainer />
  </div>

  <!-- Super Admin Control Center Layout -->
  <div v-else class="relative flex min-h-screen bg-[#24160c] text-[#f0e0c0] selection:bg-[#f0d060]/30 selection:text-[#fef08a]">
    <!-- Ambient Background Lighting Orbs (Warm Amber & Green RPG Glow) -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div class="absolute -left-[20%] -top-[10%] h-[500px] w-[500px] rounded-full bg-amber-600/12 blur-[130px]" />
      <div class="absolute -right-[15%] -bottom-[10%] h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[140px]" />
      <div class="absolute left-[40%] top-[40%] h-[400px] w-[400px] rounded-full bg-yellow-600/08 blur-[150px]" />
    </div>

    <!-- Desktop Sidebar (Sticky Top-0, H-Screen, Scrollable navigation & Bottom User Profile) -->
    <AppSidebar />

    <!-- Mobile Drawer Sidebar -->
    <MobileSidebar />

    <!-- Main Content Area -->
    <div class="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
      <!-- Topbar Header -->
      <AppHeader />

      <!-- Page Content View with self-managed padding per page -->
      <main class="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col">
        <slot />
      </main>
    </div>

    <!-- Global Toast Notification Container -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import MobileSidebar from "@/components/layout/MobileSidebar.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import BuddyHeader from "@/components/buddy/BuddyHeader.vue";
import BuddyBottomNav from "@/components/buddy/BuddyBottomNav.vue";
import { ToastContainer } from "@/components/ui/toast";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const { isBuddy } = useAuth();

const isBuddyView = computed(() => {
  return isBuddy.value || route.path.startsWith("/buddy");
});
</script>
