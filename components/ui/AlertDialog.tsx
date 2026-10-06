"use client";

import { Checkmark } from "@carbon/icons-react";
import { useDialogStore } from "@/store/dialogStore";

export function AlertDialog() {
  const alert = useDialogStore((s) => s.alert);
  const closeAlert = useDialogStore((s) => s.closeAlert);

  if (!alert.open) return null;

  return (
    <dialog className="modal modal-open ff-modal" open>
      <div className="modal-box border border-[var(--ff-border)] bg-[var(--ff-panel)] text-[var(--ff-text)] shadow-2xl">
        <h3 className="font-display flex items-center gap-2 text-xl font-bold tracking-tight">
          <Checkmark
            size={20}
            className="ff-icon shrink-0 text-[var(--ff-accent)]"
          />
          {alert.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ff-muted)]">
          {alert.message}
        </p>
        <div className="modal-action">
          <button type="button" className="btn ff-btn-primary" onClick={closeAlert}>
            OK
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60">
        <button type="button" onClick={closeAlert}>
          close
        </button>
      </form>
    </dialog>
  );
}
