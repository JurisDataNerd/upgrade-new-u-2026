import { ref } from "vue";

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "primary";
  icon?: "logout" | "alert" | "trash" | "shield" | "info" | "check";
  loading?: boolean;
}

const isOpen = ref(false);
const isBusy = ref(false);
const options = ref<ConfirmOptions>({
  title: "Konfirmasi Tindakan",
  description: "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmText: "Konfirmasi",
  cancelText: "Batal",
  variant: "primary",
  icon: "alert",
  loading: false,
});

let resolvePromise: ((value: boolean) => void) | null = null;

export function useConfirm() {
  function show(opts: ConfirmOptions): Promise<boolean> {
    options.value = {
      confirmText: opts.variant === "danger" ? "Ya, Lanjutkan" : "Konfirmasi",
      cancelText: "Batal",
      variant: "primary",
      icon: "alert",
      loading: false,
      ...opts,
    };
    isOpen.value = true;
    isBusy.value = false;

    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });
  }

  function handleConfirm() {
    isOpen.value = false;
    isBusy.value = false;
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
    }
  }

  function handleCancel() {
    isOpen.value = false;
    isBusy.value = false;
    if (resolvePromise) {
      resolvePromise(false);
      resolvePromise = null;
    }
  }

  return {
    isOpen,
    isBusy,
    options,
    show,
    handleConfirm,
    handleCancel,
  };
}

// Alias for developers looking for useConfirmModal
export const useConfirmModal = useConfirm;
