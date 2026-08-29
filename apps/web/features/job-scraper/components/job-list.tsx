"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyJobs, type CompanyJob } from "@/features/job-scraper/hooks";

function JobCard({ job }: { job: CompanyJob }) {
  return (
    <a
      href={job.url}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col gap-2 rounded-xl border border-line-2 bg-panel-2 p-4 transition-colors hover:border-sand"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-extrabold leading-tight">{job.title}</h3>
        {job.postedAt && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {new Date(job.postedAt).toLocaleDateString()}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {job.companyName}
        {job.location ? ` · ${job.location}` : ""}
      </p>
      {job.snippet && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {job.snippet}
        </p>
      )}
    </a>
  );
}

export function JobList({ company }: { company: string | undefined }) {
  const jobs = useCompanyJobs(company);

  if (!company) return null;

  if (jobs === undefined) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin ofertas guardadas para <strong>{company}</strong> todavía.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  );
}
