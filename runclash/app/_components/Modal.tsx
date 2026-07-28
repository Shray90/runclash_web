"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }: any) {
  // HACK: delay mount to allow exit animation before removing from DOM
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // FIXME: close on Escape key — currently only close button works
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        open ? "bg-black/50 backdrop-blur-sm" : "bg-transparent pointer-events-none"
      }`}
      onClick={(e) => {
        // REVIEW: close when clicking overlay? currently only onClose
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl transition-all duration-200 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
