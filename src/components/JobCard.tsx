import { JobListing } from "@/types/job";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, BuildingIcon } from "lucide-react";

interface JobCardProps {
  job: JobListing;
}

export const JobCard = ({ job }: JobCardProps) => {
  const daysLeft = Math.ceil(
    (new Date(job.expiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
          <div className="flex items-center text-gray-600 gap-4">
            <span className="flex items-center gap-1">
              <BuildingIcon className="w-4 h-4" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              {job.location}
            </span>
          </div>
        </div>
        <Badge variant={job.type === "premium" ? "default" : "secondary"}>
          {job.type === "premium" ? "Premium" : "Free"}
        </Badge>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-4 h-4" />
          {daysLeft} ημέρες απομένουν
        </div>
        {job.salary && <div className="font-semibold text-primary">{job.salary}</div>}
      </div>
    </Card>
  );
};