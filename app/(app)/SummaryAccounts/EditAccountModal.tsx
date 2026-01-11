"use client";

import { useEffect, useState } from "react";
import type { BankAccount } from "@/features/accounts/types";
import { money } from "@/features/accounts/types";

export function EditAccountModal(props: {
    open: boolean;
    account: BankAccount | null;
    onClose: () => void;
    onDelete: (accountId: string) => Promise<void> | void;
}) {
    const { open, account, onClose, onDelete } = props;
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) setError(null);
    }, [open, account?.id]);

    // Guard: modal closed OR no account selected
    if (!open || !account) return null;

    // ✅ Freeze non-null account so TS is happy even inside callbacks
    const acc = account;

    async function handleDelete() {
        setError(null);

        const ok = confirm(`Delete account "${acc.name}"? This cannot be undone.`);
        if (!ok) return;

        try {
            setDeleting(true);
            await onDelete(acc.id);
            onClose();
        } catch (e: any) {
            setError(e.message ?? "Unable to delete account");
            console.log("Error deleting account:", e);
        } finally {
            setDeleting(false);
        }
    }

    function handleClose() {
        setError(null);
        onClose();
    }



    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

            <div className="absolute left-1/2 top-1/2 w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl">
                <div className="p-5 border-b flex items-center justify-between">
                    <div>
                        <div className="text-lg font-semibold">Edit account</div>
                        <div className="text-sm text-gray-600">{acc.name}</div>
                    </div>

                    <button
                        className="rounded-xl border px-3 py-2 hover:bg-gray-50"
                        onClick={handleClose}
                        disabled={deleting}
                    >
                        Close
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    {/* ✅ put it HERE so it shows inside the modal */}
                    {error && (
                        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="text-sm">
                        <div className="text-gray-600">Type</div>
                        <div className="font-medium">{acc.creditOrDebit}</div>
                    </div>

                    <div className="text-sm">
                        <div className="text-gray-600">Balance</div>
                        <div className="font-medium">{money(acc.balance)}</div>
                    </div>
                </div>

                <div className="p-5 border-t flex items-center justify-between">
                    <button
                        className="rounded-xl border px-3 py-2 hover:bg-gray-50"
                        onClick={handleClose}
                        disabled={deleting}
                    >
                        Cancel
                    </button>

                    <button
                        className="rounded-xl px-3 py-2 border border-red-300 text-red-700 hover:bg-red-50"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Delete account"}
                    </button>
                </div>
            </div>
        </div>
    );

}
