"use client";
import React from "react";

export default function Modal({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-sm text-muted">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
