"use client";

import { useState } from "react";

export function AstraxFaq({ items }: { items: Array<[string, string]> }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map(([question, answer], index) => {
        const isOpen = activeIndex === index;
        const buttonId = `faq-button-${index}`;
        const panelId = `faq-panel-${index}`;

        return (
          <div
            key={question}
            className="overflow-hidden rounded-3 border"
            style={{ borderColor: isOpen ? "var(--tc-theme-primary)" : "rgba(255,255,255,0.16)" }}
          >
            <button
              id={buttonId}
              type="button"
              className="d-flex w-100 align-items-center justify-content-between gap-4 border-0 bg-transparent px-4 py-4 text-start"
              onClick={() => setActiveIndex(isOpen ? -1 : index)}
              aria-controls={panelId}
              aria-expanded={isOpen}
            >
              <span className="fs-20 fw-bold text-white">{question}</span>
              <span
                className="d-inline-flex flex-shrink-0 align-items-center justify-content-center rounded-circle fw-bold"
                style={{
                  width: 34,
                  height: 34,
                  backgroundColor: isOpen ? "var(--tc-theme-primary)" : "rgba(255,255,255,0.08)",
                  color: isOpen ? "var(--tc-system-black)" : "var(--tc-system-white)",
                }}
                aria-hidden="true"
              >
                {isOpen ? "-" : "+"}
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="overflow-hidden px-4"
              style={{
                maxHeight: isOpen ? 260 : 0,
                opacity: isOpen ? 1 : 0,
                transition: "max-height 220ms ease, opacity 180ms ease",
              }}
            >
              <p className="mb-0 pb-4 fs-6" style={{ color: "rgba(255,255,255,0.76)", lineHeight: 1.7 }}>
                {answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
