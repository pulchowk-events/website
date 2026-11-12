"use client";

import { useState } from "react";
import { SaveButton } from "@/app/components/shell/SaveButton";

interface Props {
  itemType: "post" | "event" | "job" | "project";
  itemId: string;
  children: React.ReactNode;
}

export function SavedItem({ itemType, itemId, children }: Props) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="saved-item">
      <div className="saved-item__row">{children}</div>
      <div className="saved-item__action">
        <SaveButton
          itemType={itemType}
          itemId={itemId}
          initialSaved={true}
          onChange={(saved) => setHidden(!saved)}
        />
      </div>
    </div>
  );
}
