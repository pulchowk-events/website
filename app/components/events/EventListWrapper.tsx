"use client";

import { EventListGrouped } from "./EventListGrouped";

interface Props {
  events: any[];
  isPast: boolean;
  savedIds: string[];
  userId?: string;
  isAdmin: boolean;
}

export function EventListWrapper({ events, isPast, savedIds, userId, isAdmin }: Props) {
  const savedSet = new Set(savedIds);
  return (
    <EventListGrouped
      events={events}
      isPast={isPast}
      savedIds={savedSet}
      userId={userId}
      isAdmin={isAdmin}
    />
  );
}
