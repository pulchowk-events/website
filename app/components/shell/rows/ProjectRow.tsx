import Link from "next/link";
import { SmartImg } from "@/app/components/ui/SmartImg";

interface ProjectRowProps {
  project: {
    id: number;
    name: string;
    description?: string | null;
    url: string;
    image_url?: string | null;
    votes?: number | null;
  };
  rank?: number;
}

export function ProjectRow({ project, rank }: ProjectRowProps) {
  return (
    <Link href={"/product-hunt/" + project.url} className="row project-row">
      {rank !== undefined && <span className="project-row__rank">{rank}</span>}
      <span className="project-row__logo">
        <SmartImg
          src={project.image_url}
          alt=""
          seed={String(project.id)}
          fallback={<span className="project-row__logo-initial">{project.name.charAt(0)}</span>}
        />
      </span>
      <div className="project-row__body">
        <p className="row-title">{project.name}</p>
        {project.description && <p className="row-excerpt row-excerpt--single">{project.description}</p>}
      </div>
      <span className="project-row__votes">{project.votes ?? 0}</span>
    </Link>
  );
}
