"use client";

import { useId, type KeyboardEvent, type ReactNode } from "react";

export type TabItem<T extends string> = {
  id: T;
  label: ReactNode;
  meta?: ReactNode;
};

export function Tabs<T extends string>({
  id,
  label,
  tabs,
  value,
  onChange,
  panelId,
  className,
}: {
  id?: string;
  label: string;
  tabs: readonly TabItem<T>[];
  value: T | null;
  onChange: (id: T) => void;
  panelId?: string;
  className?: string;
}) {
  const generatedId = useId();
  const baseId = id ?? generatedId;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;

    const nextIndex =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (index + 1) % buttons.length
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (index - 1 + buttons.length) % buttons.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? buttons.length - 1
              : -1;

    if (nextIndex < 0) return;
    event.preventDefault();

    const next = buttons[nextIndex];
    const tab = tabs.find((item) => item.id === next.dataset.value);
    next.focus();
    if (tab) onChange(tab.id);
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={["flex flex-wrap items-baseline gap-x-5 gap-y-2", className].filter(Boolean).join(" ")}
      onKeyDown={onKeyDown}
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === value;
        return (
          <span key={tab.id} className="inline-flex items-baseline gap-2">
            <button
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              data-value={tab.id}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected || (value === null && index === 0) ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={
                selected
                  ? "cursor-pointer font-medium text-[#21201c]"
                  : "cursor-pointer text-[#63635e] hover:text-[#21201c]"
              }
            >
              {tab.label}
            </button>
            {tab.meta ? <span className="text-[#63635e]">{tab.meta}</span> : null}
          </span>
        );
      })}
    </div>
  );
}
