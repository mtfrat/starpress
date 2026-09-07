"use client";

import { Toaster, toast } from "sonner";

export function ToastProvider() {
  return <Toaster position="bottom-right" richColors />;
}

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  info: (message: string) => toast.info(message),
  dismiss: (id: string | number) => toast.dismiss(id),
};
