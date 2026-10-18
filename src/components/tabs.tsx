"use client";

import type { ReactNode } from "react";
import { Tabs as TabsRoot, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  id: string;
  label: string;
  tabs: readonly TabItem<T>[];
  value: T | null;
  onChange: (id: T) => void;
  panelId?: string;
  className?: string;
}) {
  return (
    <TabsRoot
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next as T);
      }}
      className={className}
    >
      <TabsList aria-label={label}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            id={`${id}-tab-${tab.id}`}
            value={tab.id}
            aria-controls={panelId}
          >
            {tab.label}
            {tab.meta ? (
              <span className="font-normal text-muted-foreground">{tab.meta}</span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </TabsRoot>
  );
}
