<template>
  <Sheet :open="mobileOpen" @update:open="(v: boolean) => (v ? openMobile() : closeMobile())">
    <SheetContent side="left" class="w-[280px] p-0 flex flex-col bg-[#1a140f] border-r-2 border-[#4a3624] text-foreground">
      <!-- Sheet Header Brand -->
      <SheetHeader class="border-b-2 border-[#4a3624] px-4 py-3.5 bg-[#15100c]">
        <SheetTitle class="flex items-center gap-3">
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[#f59e0b] bg-[#271d15] p-1 shadow-sm"
          >
            <img src="/unu.png" alt="UNU Logo" class="h-full w-auto object-contain" />
          </div>
          <div class="flex flex-col leading-tight text-left">
            <div class="flex items-center gap-1.5">
              <span class="font-pixel text-xs font-bold tracking-wider text-[#f59e0b]">GENIUS</span>
              <span class="border border-[#ca8a04]/40 bg-[#2b2014] px-1 py-0.2 text-[9px] font-bold text-[#facc15] font-mono">2026</span>
            </div>
            <span class="text-[9px] font-mono text-muted-foreground">UNU YOGYAKARTA</span>
          </div>
        </SheetTitle>
      </SheetHeader>

      <!-- Scrollable Navigation -->
      <nav class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
        <div v-for="group in navGroups" :key="group.label">
          <p class="mb-1.5 px-3 font-pixel text-[9px] uppercase tracking-wider text-[#f59e0b]/70">
            {{ group.label }}
          </p>

          <div class="space-y-1">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              @click="closeMobile"
              :class="[
                'flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all border',
                isActive(item.to)
                  ? 'bg-[#2b2014] text-[#facc15] border-[#f59e0b] shadow-sm'
                  : 'border-transparent text-muted-foreground hover:bg-[#271d15] hover:text-foreground hover:border-[#523e2b]',
              ]"
            >
              <component
                :is="item.icon"
                :class="[
                  'h-4 w-4 shrink-0',
                  isActive(item.to) ? 'text-[#f59e0b]' : 'text-muted-foreground',
                ]"
              />
              <span class="font-sans text-xs">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Bottom User Profile Card -->
      <div class="shrink-0 border-t-2 border-[#4a3624] bg-[#15100c] p-3">
        <div class="flex items-center justify-between gap-2 rounded border border-[#4a3624] bg-[#221812] p-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <Avatar class="h-8 w-8 border-2 border-[#f59e0b] bg-[#271d15]">
              <AvatarFallback class="bg-[#271d15] font-mono text-xs font-bold text-[#f59e0b]">
                {{ userInitials }}
              </AvatarFallback>
            </Avatar>
            <div class="flex flex-col min-w-0 leading-tight">
              <span class="truncate text-xs font-bold text-foreground">
                {{ user?.fullName || "Administrator" }}
              </span>
              <span class="font-mono text-[10px] text-muted-foreground">
                @{{ user?.username || "admin" }}
              </span>
            </div>
          </div>

          <button
            @click="logout"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#f59e0b] bg-[#1a140f] text-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:scale-110 hover:bg-[#2b2014] hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all"
            title="Keluar Akun"
          >
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
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
  LogOut,
} from "lucide-vue-next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLayoutState } from "@/composables/useLayoutState";
import { useAuth } from "@/composables/useAuth";

const { mobileOpen, openMobile, closeMobile } = useLayoutState();
const { user, userInitials, logout } = useAuth();
const route = useRoute();

function isActive(path: string) {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
}

const navGroups = [
  {
    label: "Main Quest",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/leaderboard", label: "Live Leaderboard", icon: Trophy },
      { to: "/sessions", label: "Live Matches", icon: Radio },
    ],
  },
  {
    label: "Organisasi Tim",
    items: [
      { to: "/participants", label: "Peserta RPG", icon: GraduationCap },
      { to: "/buddies", label: "Buddy (GM)", icon: UserCheck },
      { to: "/teams", label: "Tim Petualang", icon: Users },
      { to: "/users", label: "Semua Pengguna", icon: UserCog },
    ],
  },
  {
    label: "Kampus & Pos",
    items: [
      { to: "/floors", label: "9 Lantai UNU", icon: Building2 },
      { to: "/routes", label: "Rute Perjalanan", icon: GitFork },
      { to: "/missions", label: "Misi & Pos", icon: Target },
      { to: "/stages", label: "Game Stages", icon: Layers },
      { to: "/qr-center", label: "QR Print Center", icon: QrCode },
    ],
  },
  {
    label: "Games, AI & Gelar",
    items: [
      { to: "/games", label: "Arena Games", icon: Gamepad2 },
      { to: "/questions", label: "Bank Soal", icon: HelpCircle },
      { to: "/ai-studio", label: "AI Studio", icon: Sparkles },
      { to: "/achievements", label: "Gelar & Achievements", icon: Award },
    ],
  },
  {
    label: "Ledger & Komando",
    items: [
      { to: "/scores", label: "Point Ledger", icon: Trophy },
      { to: "/audit-logs", label: "Audit Logs", icon: Target },
      { to: "/settings", label: "Emergency & Settings", icon: ShieldAlert },
    ],
  },
];
</script>
