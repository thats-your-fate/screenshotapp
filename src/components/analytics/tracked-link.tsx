"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { trackEvent } from "@/components/analytics/google-analytics";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventName: string;
  eventParams?: Record<string, unknown>;
};

export function TrackedLink({ eventName, eventParams, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackEvent(eventName, eventParams);
        onClick?.(event);
      }}
    />
  );
}
