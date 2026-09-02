import { ref } from "vue";

const sidebarCollapsed = ref(false);
const mobileOpen = ref(false);
const customPageTitle = ref<string | null>(null);
const customPageSubtitle = ref<string | null>(null);
const customPageBadge = ref<string | null>(null);
const customPageIcon = ref<any>(null);

export function useLayoutState() {
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function openMobile() {
    mobileOpen.value = true;
  }

  function closeMobile() {
    mobileOpen.value = false;
  }

  function setPageHeader(options: {
    title?: string;
    subtitle?: string;
    badge?: string;
    icon?: any;
  }) {
    customPageTitle.value = options.title ?? null;
    customPageSubtitle.value = options.subtitle ?? null;
    customPageBadge.value = options.badge ?? null;
    customPageIcon.value = options.icon ?? null;
  }

  function clearPageHeader() {
    customPageTitle.value = null;
    customPageSubtitle.value = null;
    customPageBadge.value = null;
    customPageIcon.value = null;
  }

  return {
    sidebarCollapsed,
    mobileOpen,
    customPageTitle,
    customPageSubtitle,
    customPageBadge,
    customPageIcon,
    toggleSidebar,
    openMobile,
    closeMobile,
    setPageHeader,
    clearPageHeader,
  };
}
