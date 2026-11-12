import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { ProjectVoteButton } from "./ProjectVoteButton";

interface Project {
  id: number;
  name: string;
  description: string | null;
  url: string;
  votes: number | null;
  image_url: string | null;
  redirect_url?: string | null;
  users?: { name: string | null; image: string | null } | null;
}

export function ProjectRow({ project, rank }: { project: Project; rank: number }) {
  return (
    <div className="prow">
      <span className="prow__rank">{rank}</span>
      <ProjectVoteButton productId={project.id} initialVotes={project.votes || 0} />
      <Link href={"/product-hunt/" + project.url} className="prow__link">
        <span className="prow__logo">
          {project.image_url ? (
            <Image src={project.image_url} alt="" width={56} height={56} unoptimized />
          ) : (
            <span className="prow__logo-initial">{project.name.charAt(0).toUpperCase()}</span>
          )}
        </span>
        <div className="prow__body">
          <p className="row-title">{project.name}</p>
          {project.description && <p className="prow__tagline">{project.description}</p>}
          {project.users?.name && (
            <div className="row-meta">
              {project.users.image && (
                <span className="row-avatar">
                  <Image src={project.users.image} alt="" width={16} height={16} />
                </span>
              )}
              <span>{project.users.name}</span>
            </div>
          )}
        </div>
      </Link>
      {project.redirect_url && (
        <a
          href={project.redirect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="prow__ext"
          aria-label="Visit project"
          title="Visit project"
        >
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}
