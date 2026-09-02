import { ref } from "vue";

export interface AdminToast {
  id: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "BROADCAST";
  title: string;
  message: string;
  duration?: number;
}

const toasts = ref<AdminToast[]>([]);

export function useToast() {
  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function add(item: Omit<AdminToast, "id">) {
    const id = "adm-t-" + Math.random().toString(36).substring(2, 9) + "-" + Date.now();
    const duration = item.duration || (item.type === "BROADCAST" ? 8000 : 4000);
    const toastItem: AdminToast = {
      ...item,
      id,
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

  function success(title: string, message = "") {
    return add({ type: "SUCCESS", title, message });
  }

  function broadcast(title: string, message = "") {
    return add({ type: "BROADCAST", title, message, duration: 8000 });
  }

  function warning(title: string, message = "") {
    return add({ type: "WARNING", title, message });
  }

  function error(title: string, message = "") {
    return add({ type: "ERROR", title, message, duration: 6000 });
  }

  function info(title: string, message = "") {
    return add({ type: "INFO", title, message });
  }

  return {
    toasts,
    add,
    remove,
    success,
    broadcast,
    warning,
    error,
    info,
  };
}
