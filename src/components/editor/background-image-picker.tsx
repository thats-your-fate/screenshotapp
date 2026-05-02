"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Item = {
  url: string;
  label: string;
};

export function BackgroundImagePicker({
  items,
  value,
  onChange,
}: {
  items: Item[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0, width: 640 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const current = items.find((item) => item.url === value);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const desiredWidth = 640;
      const viewportPadding = 12;
      const maxWidth = Math.max(320, window.innerWidth - viewportPadding * 2);
      const width = Math.min(desiredWidth, maxWidth);
      const maxLeft = window.innerWidth - width - viewportPadding;
      const left = Math.max(viewportPadding, Math.min(rect.left, maxLeft));
      const top = rect.bottom + 6;
      setMenuPos({ left, top, width });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-left text-xs text-slate-700"
      >
        {current ? current.label : "Choose existing background"}
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
        <div
          ref={menuRef}
          className="fixed z-[10000] rounded-md border border-slate-300 bg-white p-2 shadow-xl"
          style={{ left: menuPos.left, top: menuPos.top, width: menuPos.width }}
        >
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="mb-2 w-full rounded border border-slate-200 px-2 py-1 text-left text-xs text-slate-600 hover:bg-slate-50"
          >
            None
          </button>
          <div className="grid max-h-[390px] grid-cols-3 gap-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <button
                key={item.url}
                type="button"
                onClick={() => {
                  onChange(item.url);
                  setOpen(false);
                }}
                className={`w-full overflow-hidden rounded border text-left ${
                  value === item.url ? "border-amber-400" : "border-slate-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.label} className="h-24 w-full object-cover" />
                <p className="truncate px-2 py-1 text-[11px] text-slate-600">{item.label}</p>
              </button>
            ))}
          </div>
        </div>,
        document.body,
          )
        : null}
    </div>
  );
}
