"use client";

import { AlertDialog } from "./AlertDialog";
import { ConfirmDialog } from "./ConfirmDialog";

export function DialogHost() {
  return (
    <>
      <AlertDialog />
      <ConfirmDialog />
    </>
  );
}
