import Link from "next/link";
import Image from "next/image";

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
        {project.image_url ? (
          <Image src={project.image_url} alt="" width={40} height={40} unoptimized />
        ) : (
          <span className="project-row__logo-initial">{project.name.charAt(0)}</span>
        )}
      </span>
      <div className="project-row__body">
        <p className="row-title">{project.name}</p>
        {project.description && <p className="row-excerpt row-excerpt--single">{project.description}</p>}
      </div>
      <span className="project-row__votes">{project.votes ?? 0}</span>
    </Link>
  );
}
