/**
 * Dialog zur Eingabe eines Gastnamens für Joker-Mitarbeiter.
 */
"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface JokerNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (guestName: string) => void;
  onCancel: () => void;
}

export function JokerNameDialog(props: JokerNameDialogProps) {
  const { open, onOpenChange, onConfirm, onCancel } = props;
  const [guestName, setGuestName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(guestName.trim());
    setGuestName("");
  }

  function handleCancel() {
    setGuestName("");
    onCancel();
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/10" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
          <Dialog.Title className="mb-1 text-sm font-semibold text-stone-800">
            Joker-Zuweisung
          </Dialog.Title>
          <Dialog.Description className="mb-3 text-xs text-stone-500">
            Gib den Namen der Person ein, die diesen Platz nutzt.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-stone-600">
                Name der Person
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="z.B. Maria"
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:border-yellow-300 focus:outline-none focus:ring-1 focus:ring-yellow-300"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="rounded-full bg-yellow-300 px-3 py-1.5 text-xs font-medium text-stone-800 hover:bg-yellow-400"
              >
                Zuweisen
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
