"use client";

import { WarningAlt } from "@carbon/icons-react";
import { useDialogStore } from "@/store/dialogStore";

export function ConfirmDialog() {
  const confirm = useDialogStore((s) => s.confirm);
  const closeConfirm = useDialogStore((s) => s.closeConfirm);

  if (!confirm.open) return null;

  return (
    <dialog className="modal modal-open ff-modal" open>
      <div className="modal-box border border-[var(--ff-border)] bg-[var(--ff-panel)] text-[var(--ff-text)] shadow-2xl">
        <h3 className="font-display flex items-center gap-2 text-xl font-bold tracking-tight">
          <WarningAlt
            size={20}
            className="ff-icon shrink-0 text-[var(--ff-danger)]"
          />
          {confirm.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ff-muted)]">
          {confirm.message}
        </p>
        <div className="modal-action gap-2">
          <button
            type="button"
            className="btn btn-ghost text-[var(--ff-muted)]"
            onClick={() => closeConfirm(false)}
          >
            {confirm.cancelLabel}
          </button>
          <button
            type="button"
            className="btn ff-btn-danger"
            onClick={() => closeConfirm(true)}
          >
            {confirm.confirmLabel}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60">
        <button type="button" onClick={() => closeConfirm(false)}>
          close
        </button>
      </form>
    </dialog>
  );
}
