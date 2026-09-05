<template>
  <aside
    :class="[
      'sticky top-0 h-screen hidden lg:flex flex-col border-r-2 border-[#5a3a18] bg-[#24170e] transition-all duration-300 ease-in-out select-none shrink-0 z-30',
      sidebarCollapsed ? 'w-[74px]' : 'w-[264px]',
    ]"
  >
    <!-- 1. Brand Header with Floating Collapse/Expand Button at Top -->
    <div class="relative flex h-16 shrink-0 items-center justify-between border-b-2 border-[#5a3a18] px-3.5 bg-[#1e130a]">
      <!-- Brand Logo & Title -->
      <NuxtLink to="/" class="flex items-center gap-2.5 overflow-hidden group">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[#f59e0b] bg-[#2d1b0e] p-1 shadow-[0_0_8px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform"
        >
          <img src="/unu.png" alt="UNU Logo" class="h-full w-auto object-contain" />
        </div>
        <div v-if="!sidebarCollapsed" class="flex flex-col leading-tight min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="font-pixel text-xs font-bold tracking-wider text-[#f59e0b] truncate">GENIUS</span>
            <span class="border border-[#ca8a04]/40 bg-[#2b2014] px-1 py-0.2 text-[9px] font-bold text-[#facc15] font-mono shrink-0">2026</span>
          </div>
          <span class="text-[9px] font-mono text-muted-foreground tracking-tight truncate">UNU YOGYAKARTA</span>
        </div>
      </NuxtLink>

      <!-- Floating Top Toggle Button (Desktop) -->
      <!-- <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              @click="toggleSidebar"
              :class="[
                'flex h-7 w-7 items-center justify-center rounded border border-[#523e2b] bg-[#271d15] text-[#f59e0b] hover:bg-[#3d2d1e] hover:border-[#f59e0b] hover:text-[#facc15] shadow-sm transition-all active:scale-95',
                sidebarCollapsed ? 'mx-auto' : 'ml-auto',
              ]"
              :aria-label="sidebarCollapsed ? 'Lebarkan Menu' : 'Kecilkan Menu'"
            >
              <ChevronLeft v-if="!sidebarCollapsed" class="h-4 w-4 transition-transform duration-200" />
              <ChevronRight v-else class="h-4 w-4 transition-transform duration-200" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" class="bg-[#271d15] text-[#facc15] border-[#f59e0b] text-[11px] font-mono">
            {{ sidebarCollapsed ? "Lebarkan Sidebar" : "Kecilkan Sidebar" }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider> -->

      <!-- Floating Tab on Edge for Quick Hit -->
      <button
        @click="toggleSidebar"
        class="absolute -right-3.5 top-5 z-40 hidden xl:flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#f59e0b] bg-[#1a140f] text-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:scale-110 hover:bg-[#2b2014] transition-all"
        :title="sidebarCollapsed ? 'Lebarkan Sidebar' : 'Kecilkan Sidebar'"
      >
        <PanelLeftClose v-if="!sidebarCollapsed" class="h-3.5 w-3.5" />
        <PanelLeftOpen v-else class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- 2. Scrollable Navigation Menu -->
    <nav class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
      <div v-for="group in navGroups" :key="group.label">
        <p
          v-if="!sidebarCollapsed"
          class="mb-1.5 px-3 font-pixel text-[9px] uppercase tracking-wider text-[#f59e0b]/70 flex items-center justify-between"
        >
          <span>{{ group.label }}</span>
        </p>
        <div v-else class="my-2 border-t border-[#4a3624]/60" />

        <div class="space-y-1">
          <TooltipProvider v-for="item in group.items" :key="item.to">
            <Tooltip :disabled="!sidebarCollapsed">
              <TooltipTrigger as-child>
                <NuxtLink
                  :to="item.to"
                  :class="[
                    'group relative flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all duration-150 border',
                    isActive(item.to)
                      ? 'bg-[#2b2014] text-[#facc15] border-[#f59e0b] shadow-sm'
                      : 'border-transparent text-muted-foreground hover:bg-[#271d15] hover:text-foreground hover:border-[#523e2b]',
                    sidebarCollapsed && 'justify-center px-2',
                  ]"
                >
                  <!-- Active Left Indicator Bar -->
                  <div
                    v-if="isActive(item.to) && !sidebarCollapsed"
                    class="absolute left-0 top-1 bottom-1 w-1 bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]"
                  />

                  <component
                    :is="item.icon"
                    :class="[
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive(item.to) ? 'text-[#f59e0b]' : 'text-muted-foreground group-hover:text-foreground',
                    ]"
                  />
                  <span v-if="!sidebarCollapsed" class="truncate font-sans text-xs">{{ item.label }}</span>
                  <Badge
                    v-if="item.badge && !sidebarCollapsed"
                    class="ml-auto text-[8px] font-pixel px-1.5 py-0 bg-[#3a291c] text-[#facc15] border border-[#ca8a04]/40"
                  >
                    {{ item.badge }}
                  </Badge>
                </NuxtLink>
              </TooltipTrigger>
              <TooltipContent side="right" v-if="sidebarCollapsed" class="bg-[#271d15] text-[#facc15] border-[#f59e0b] text-xs">
                {{ item.label }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </nav>

    <!-- 3. Bottom User Profile Card & Actions (Sticky at bottom) -->
    <div class="relative shrink-0 border-t-2 border-[#5a3a18] bg-[#1e130a] p-2.5">
      <!-- Expanded State User Card -->
      <div
        v-if="!sidebarCollapsed"
        class="flex items-center gap-2.5 rounded border border-[#5a3a18] bg-[#2d1b0e] p-2 pr-6 hover:border-[#ca8a04]/60 transition-colors min-w-0"
      >
        <!-- User Avatar & Identity -->
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="relative shrink-0">
            <div class="h-9 w-9 rounded border-2 border-[#f59e0b] bg-[#3d2b1e] overflow-hidden flex items-center justify-center p-1">
              <img
                :src="user?.role === 'ADMIN' ? '/unu.png' : (user?.avatarUrl || (user?.gender === 'FEMALE' ? '/character-cewek-avatar.png' : '/character-cowok-avatar.png'))"
                alt="Admin Avatar"
                class="h-full w-full object-contain"
              />
            </div>
            <span class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[#1a140f] bg-[#22c55e]" />
          </div>

          <div class="flex flex-col min-w-0 leading-tight">
            <div class="flex items-center gap-1.5">
              <span class="truncate font-sans text-xs font-bold text-foreground">
                {{ user?.fullName || "Administrator" }}
              </span>
            </div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="border border-[#ca8a04]/60 bg-[#362516] px-1 py-0.2 font-pixel text-[8px] text-[#facc15]">
                {{ user?.role || "ADMIN" }}
              </span>
              <span class="truncate font-mono text-[10px] text-muted-foreground">
                @{{ user?.username || "admin" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Collapsed State Avatar -->
      <div v-else class="flex flex-col items-center py-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <div class="relative cursor-pointer">
                <div class="h-9 w-9 rounded border-2 border-[#f59e0b] bg-[#271d15] overflow-hidden hover:scale-105 transition-transform shadow-[0_0_8px_rgba(245,158,11,0.25)] flex items-center justify-center p-1">
                  <img
                    :src="user?.role === 'ADMIN' ? '/unu.png' : (user?.avatarUrl || (user?.gender === 'FEMALE' ? '/character-cewek-avatar.png' : '/character-cowok-avatar.png'))"
                    alt="Admin Avatar"
                    class="h-full w-full object-contain"
                  />
                </div>
                <span class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[#1a140f] bg-[#22c55e]" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" class="bg-[#271d15] border-[#f59e0b] p-2 text-xs">
              <p class="font-bold text-[#facc15]">{{ user?.fullName || "Administrator" }}</p>
              <p class="font-mono text-[10px] text-muted-foreground">{{ user?.role }} · @{{ user?.username }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <!-- Floating Bottom Logout Button on Edge (Exact same position as top expand button) -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              @click="logout"
              class="absolute -right-3.5 top-5 z-40 hidden xl:flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#f59e0b] bg-[#1a140f] text-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:scale-110 hover:bg-[#2b2014] hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all"
              aria-label="Keluar dari akun"
            >
              <LogOut class="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" class="bg-[#271d15] text-red-300 border-red-800 text-xs font-mono">
            Keluar Akun
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import {
  LayoutDashboard,
  Trophy,
  Building2,
  GitFork,
  Target,
  Layers,
  Gamepad2,
  HelpCircle,
  Users,
  GraduationCap,
  UserCheck,
  CalendarCheck,
  UserCog,
  Sparkles,
  Award,
  Radio,
  QrCode,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-vue-next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLayoutState } from "@/composables/useLayoutState";
import { useAuth } from "@/composables/useAuth";

const { sidebarCollapsed, toggleSidebar } = useLayoutState();
const { user, userInitials, logout } = useAuth();
const route = useRoute();

const isActive = (to: string) => {
  if (to === "/") return route.path === "/";
  return route.path.startsWith(to);
};

const navGroups = [
  {
    label: "Main Quest",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard },
      { label: "Leaderboard", to: "/leaderboard", icon: Trophy, badge: "LIVE" },
      { label: "Live Matches", to: "/sessions", icon: Radio, badge: "RADAR" },
    ],
  },
  {
    label: "Organisasi Tim",
    items: [
      { label: "Presensi Harian", to: "/attendance", icon: CalendarCheck, badge: "GATE" },
      { label: "Portal Buddy", to: "/buddy", icon: UserCheck, badge: "FIELD" },
      { label: "Peserta RPG", to: "/participants", icon: GraduationCap },
      { label: "Buddy (GM)", to: "/buddies", icon: UserCheck },
      { label: "Tim Petualang", to: "/teams", icon: Users },
      { label: "Semua Pengguna", to: "/users", icon: UserCog },
    ],
  },
  {
    label: "Kampus & Pos",
    items: [
      { label: "9 Lantai UNU", to: "/floors", icon: Building2 },
      { label: "Rute Perjalanan", to: "/routes", icon: GitFork },
      { label: "Misi & Pos", to: "/missions", icon: Target },
      { label: "Game Stages", to: "/stages", icon: Layers },
      { label: "QR Print Center", to: "/qr-center", icon: QrCode },
    ],
  },
  {
    label: "Games, AI & Gelar",
    items: [
      { label: "Arena Games", to: "/games", icon: Gamepad2 },
      { label: "Bank Soal", to: "/questions", icon: HelpCircle },
      { label: "AI Studio", to: "/ai-studio", icon: Sparkles, badge: "AI" },
      { label: "Gelar & Achievements", to: "/achievements", icon: Award },
    ],
  },
  {
    label: "Ledger & Komando",
    items: [
      { label: "Point Ledger", to: "/scores", icon: Trophy },
      { label: "Audit Logs", to: "/audit-logs", icon: Target },
      { label: "Emergency & Settings", to: "/settings", icon: ShieldAlert },
    ],
  },
];
</script>
