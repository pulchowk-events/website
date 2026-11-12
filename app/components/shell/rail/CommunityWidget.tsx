import { MessageSquare } from "lucide-react";
import { RailWidget } from "./RailWidget";

export function CommunityWidget({ discordUrl }: { discordUrl: string }) {
  return (
    <RailWidget title="Community">
      <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="rail-community">
        <MessageSquare size={16} />
        <span className="rail-community__label">Join Discord</span>
      </a>
    </RailWidget>
  );
}
