"use client";

import { create } from "zustand";

type AlertState = {
  open: boolean;
  title: string;
  message: string;
  resolve?: () => void;
};

type ConfirmState = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve?: (ok: boolean) => void;
};

type DialogStore = {
  alert: AlertState;
  confirm: ConfirmState;
  showAlert: (title: string, message: string) => Promise<void>;
  showConfirm: (
    title: string,
    message: string,
    opts?: { confirmLabel?: string; cancelLabel?: string },
  ) => Promise<boolean>;
  closeAlert: () => void;
  closeConfirm: (ok: boolean) => void;
};

export const useDialogStore = create<DialogStore>((set, get) => ({
  alert: { open: false, title: "", message: "" },
  confirm: {
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
  },
  showAlert: (title, message) =>
    new Promise<void>((resolve) => {
      set({ alert: { open: true, title, message, resolve } });
    }),
  showConfirm: (title, message, opts) =>
    new Promise<boolean>((resolve) => {
      set({
        confirm: {
          open: true,
          title,
          message,
          confirmLabel: opts?.confirmLabel ?? "Confirm",
          cancelLabel: opts?.cancelLabel ?? "Cancel",
          resolve,
        },
      });
    }),
  closeAlert: () => {
    const { alert } = get();
    alert.resolve?.();
    set({ alert: { open: false, title: "", message: "" } });
  },
  closeConfirm: (ok) => {
    const { confirm } = get();
    confirm.resolve?.(ok);
    set({
      confirm: {
        open: false,
        title: "",
        message: "",
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
      },
    });
  },
}));

export function alertDialog(title: string, message: string) {
  return useDialogStore.getState().showAlert(title, message);
}

export function confirmDialog(
  title: string,
  message: string,
  opts?: { confirmLabel?: string; cancelLabel?: string },
) {
  return useDialogStore.getState().showConfirm(title, message, opts);
}
