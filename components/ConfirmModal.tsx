"use client";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-80 rounded-lg border p-4 shadow-xl"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="text-sm font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded text-xs font-semibold"
            style={{
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded text-xs font-semibold text-white"
            style={{ background: "#dc2626" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
