<template>
  <header
    class="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b-2 border-[#5a3a18] bg-[#24170e]/95 px-4 md:px-6 backdrop-blur-md shadow-md gap-3"
  >
    <!-- Left: Mobile Trigger + Clean Page Title & Icon -->
    <div class="flex items-center gap-3 min-w-0">
      <!-- Mobile Drawer Trigger -->
      <button
        @click="openMobile"
        class="inline-flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:bg-[#3d2d1e] hover:border-[#f59e0b] lg:hidden transition-colors"
        title="Buka Menu"
      >
        <Menu class="h-4 w-4" />
      </button>

      <!-- Clean Page Title & Icon (Replaces the old stacked UNU Yogyakarta badge) -->
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#271d15] border-2 border-[#f59e0b]/60 text-[#f59e0b] shadow-sm">
          <component :is="currentPageIcon" class="h-4 w-4" />
        </div>
        <div class="flex items-center gap-2 min-w-0">
          <h1 class="font-pixel text-xs sm:text-sm md:text-base font-bold text-[#f59e0b] tracking-wider truncate">
            {{ currentSectionTitle }}
          </h1>
          <span
            v-if="customPageBadge"
            class="hidden md:inline-flex border border-[#ca8a04]/40 bg-[#2b2014] px-2 py-0.5 text-[9px] font-pixel text-[#facc15] shrink-0"
          >
            {{ customPageBadge }}
          </span>
        </div>
      </div>
    </div>

    <!-- Right: Dynamic Topbar Toolbar Actions & Controls -->
    <div class="flex items-center gap-2 shrink-0">
      <!-- Teleport Target for Page-Specific Actions & Toolbar -->
      <div id="topbar-actions" class="flex items-center gap-2"></div>
      <div id="topbar-toolbar" class="flex items-center gap-2"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  Menu,
  LayoutDashboard,
  Trophy,
  Building2,
  GitFork,
  Target,
  Layers,
  Users,
  UserCog,
  GraduationCap,
  UserCheck,
  Gamepad2,
  HelpCircle,
  Sparkles,
  Award,
  Radio,
  QrCode,
  ShieldAlert,
  FileText,
  Settings,
} from "lucide-vue-next";
import { useLayoutState } from "@/composables/useLayoutState";

const { openMobile, customPageTitle, customPageBadge, customPageIcon } = useLayoutState();
const route = useRoute();

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  leaderboard: "Leaderboard & Point Ledger",
  sessions: "Live Matches",
  participants: "Manajemen Peserta RPG & Evolusi",
  buddies: "Manajemen Buddy (GM)",
  teams: "Manajemen Tim Petualang",
  users: "Manajemen Pengguna",
  floors: "9 Lantai & Lokasi UNU",
  routes: "Rute Perjalanan",
  missions: "Misi & Pos Tantangan",
  stages: "Game Stages",
  "qr-center": "QR Print Center",
  games: "Arena Games",
  questions: "Bank Soal & Kuis",
  "ai-studio": "AI Studio",
  achievements: "Gelar & Achievements",
  scores: "Koreksi Skor & Ledger",
  "audit-logs": "Audit Logs",
  settings: "Pengaturan Sistem",
};

const routeIcons: Record<string, any> = {
  "": LayoutDashboard,
  leaderboard: Trophy,
  sessions: Radio,
  participants: GraduationCap,
  buddies: UserCheck,
  teams: Users,
  users: UserCog,
  floors: Building2,
  routes: GitFork,
  missions: Target,
  stages: Layers,
  "qr-center": QrCode,
  games: Gamepad2,
  questions: HelpCircle,
  "ai-studio": Sparkles,
  achievements: Award,
  scores: ShieldAlert,
  "audit-logs": FileText,
  settings: Settings,
};

const currentSectionTitle = computed(() => {
  if (customPageTitle.value) return customPageTitle.value;
  const seg = route.path.split("/").filter(Boolean)[0] || "";
  return routeLabels[seg] || "Control Center";
});

const currentPageIcon = computed(() => {
  if (customPageIcon.value) return customPageIcon.value;
  const seg = route.path.split("/").filter(Boolean)[0] || "";
  return routeIcons[seg] || LayoutDashboard;
});
</script>
