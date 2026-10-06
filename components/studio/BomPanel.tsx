"use client";

import { Close, List } from "@carbon/icons-react";
import { useMemo } from "react";
import { getPart } from "@/lib/bricks/catalog";
import { resolveFinish } from "@/lib/bricks/material";
import { useEditorStore } from "@/store/editorStore";

type BomRow = {
  key: string;
  label: string;
  color: string;
  finish: string;
  qty: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function BomPanel({ open, onClose }: Props) {
  const bricks = useEditorStore((s) => s.bricks);

  const rows = useMemo(() => {
    const map = new Map<string, BomRow>();
    for (const b of bricks) {
      const finish = resolveFinish(b.finish);
      const key = `${b.partId}|${b.color.toLowerCase()}|${finish}`;
      const existing = map.get(key);
      if (existing) {
        existing.qty += 1;
        continue;
      }
      const part = getPart(b.partId);
      map.set(key, {
        key,
        label: part?.label ?? b.partId,
        color: b.color,
        finish,
        qty: 1,
      });
    }
    return [...map.values()].sort(
      (a, b) => b.qty - a.qty || a.label.localeCompare(b.label),
    );
  }, [bricks]);

  if (!open) return null;

  return (
    <aside className="ff-hud-panel pointer-events-auto flex max-h-[50%] w-64 flex-col gap-3 overflow-hidden rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ff-accent)]">
            Parts list
          </p>
          <h2 className="font-display flex items-center gap-2 text-lg font-bold leading-tight">
            <List size={18} className="ff-icon text-[var(--ff-accent)]" />
            BOM
          </h2>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-xs gap-1"
          onClick={onClose}
          aria-label="Close parts list"
        >
          <Close size={16} className="ff-icon" />
          Close
        </button>
      </div>
      <p className="text-xs text-[var(--ff-muted)]">
        {bricks.length} bricks · {rows.length} unique
      </p>
      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {rows.length === 0 && (
          <li className="py-6 text-center text-xs text-[var(--ff-muted)]">
            Place bricks to build a parts list.
          </li>
        )}
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center gap-2 rounded-lg border border-[var(--ff-border)] bg-[var(--ff-panel-2)] px-2 py-1.5"
          >
            <span
              className="h-6 w-6 shrink-0 rounded-md border border-black/15"
              style={{
                background: row.color,
                opacity: row.finish === "glass" ? 0.55 : 1,
              }}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{row.label}</span>
              <span className="block text-[10px] text-[var(--ff-muted)]">
                {row.color.toUpperCase()}
                {row.finish === "glass" ? " · Glass" : ""}
              </span>
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              ×{row.qty}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
