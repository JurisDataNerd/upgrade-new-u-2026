<template>
  <div class="relative flex min-h-screen bg-background text-foreground selection:bg-indigo-500/30 selection:text-indigo-200">
    <!-- Ambient Background Lighting Orbs -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div class="absolute -left-[20%] -top-[10%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />
      <div class="absolute -right-[15%] -bottom-[10%] h-[500px] w-[500px] rounded-full bg-emerald-600/08 blur-[140px]" />
      <div class="absolute left-[40%] top-[40%] h-[400px] w-[400px] rounded-full bg-cyan-600/05 blur-[150px]" />
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
import AppSidebar from "@/components/layout/AppSidebar.vue";
import MobileSidebar from "@/components/layout/MobileSidebar.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import { ToastContainer } from "@/components/ui/toast";
</script>
