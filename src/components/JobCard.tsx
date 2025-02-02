import { JobListing } from "@/types/job";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, BuildingIcon, ShareIcon, SendIcon, PhoneIcon, MailIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface JobCardProps {
  job: JobListing;
}

export const JobCard = ({ job }: JobCardProps) => {
  const { toast } = useToast();
  const daysLeft = Math.ceil(
    (new Date(job.expiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  const handleShare = async () => {
    try {
      await navigator.share({
        title: job.title,
        text: `${job.company} is hiring: ${job.title}`,
        url: window.location.href,
      });
    } catch (err) {
      toast({
        title: "Αντιγράφηκε στο πρόχειρο",
        description: "Μπορείτε να μοιραστείτε την αγγελία",
      });
    }
  };

  const handleSendCV = () => {
    window.location.href = `mailto:${job.email}?subject=Application for ${job.title} position&body=Dear ${job.company},%0D%0A%0D%0AI am interested in the ${job.title} position.%0D%0A%0D%0ABest regards`;
  };

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
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            {daysLeft} ημέρες απομένουν
          </div>
          {job.salary && <div className="font-semibold text-primary">{job.salary}</div>}
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-4 h-4" />
            {job.phone}
          </div>
          <div className="flex items-center gap-2">
            <MailIcon className="w-4 h-4" />
            {job.email}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button onClick={handleShare} variant="outline" className="flex-1">
            <ShareIcon className="w-4 h-4 mr-2" />
            Κοινοποίηση
          </Button>
          <Button onClick={handleSendCV} className="flex-1">
            <SendIcon className="w-4 h-4 mr-2" />
            Αποστολή CV
          </Button>
        </div>
      </div>
    </Card>
  );
};