import { ref } from "vue";

export type ToastType = "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "BROADCAST";

export interface AdminToast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

export interface ToastOptions {
  title: string;
  message?: string;
  description?: string;
  type?: ToastType;
  color?: "emerald" | "green" | "red" | "amber" | "yellow" | "cyan" | "blue" | "purple";
  duration?: number;
}

const toasts = ref<AdminToast[]>([]);

export function useToast() {
  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function clear() {
    toasts.value = [];
  }

  function add(item: ToastOptions | Omit<AdminToast, "id">) {
    const id = "adm-t-" + Math.random().toString(36).substring(2, 9) + "-" + Date.now();
    
    // Normalize type and message
    let toastType: ToastType = (item as any).type || "INFO";
    if ((item as ToastOptions).color) {
      const c = (item as ToastOptions).color;
      if (c === "green" || c === "emerald") toastType = "SUCCESS";
      else if (c === "red") toastType = "ERROR";
      else if (c === "amber" || c === "yellow") toastType = "WARNING";
      else if (c === "purple") toastType = "BROADCAST";
      else toastType = "INFO";
    }

    const message = (item as ToastOptions).message || (item as ToastOptions).description || "";
    const duration = item.duration ?? (toastType === "BROADCAST" ? 8000 : 4000);

    const toastItem: AdminToast = {
      id,
      type: toastType,
      title: item.title,
      message,
      duration,
    };

    toasts.value.unshift(toastItem);
    if (toasts.value.length > 5) {
      toasts.value = toasts.value.slice(0, 5);
    }

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  }

  function success(title: string, message = "", duration = 4000) {
    return add({ type: "SUCCESS", title, message, duration });
  }

  function broadcast(title: string, message = "", duration = 8000) {
    return add({ type: "BROADCAST", title, message, duration });
  }

  function warning(title: string, message = "", duration = 5000) {
    return add({ type: "WARNING", title, message, duration });
  }

  function error(title: string, message = "", duration = 6000) {
    return add({ type: "ERROR", title, message, duration });
  }

  function info(title: string, message = "", duration = 4000) {
    return add({ type: "INFO", title, message, duration });
  }

  return {
    toasts,
    add,
    remove,
    clear,
    success,
    broadcast,
    warning,
    error,
    info,
  };
}

// Aliases for Nuxt UI compatibility
export const useUToast = useToast;
