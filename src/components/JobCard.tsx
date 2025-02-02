import { JobListing } from "@/types/job";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, BuildingIcon, ShareIcon, SendIcon, PhoneIcon, MailIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleSendCV = (emailClient: string) => {
    const subject = encodeURIComponent(`Application for ${job.title} position`);
    const body = encodeURIComponent(`Dear ${job.company},\n\nI am interested in the ${job.title} position.\n\nBest regards`);
    
    const emailUrls = {
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${job.email}&su=${subject}&body=${body}`,
      outlook: `https://outlook.office.com/mail/deeplink/compose?to=${job.email}&subject=${subject}&body=${body}`,
      yahoo: `https://compose.mail.yahoo.com/?to=${job.email}&subject=${subject}&body=${body}`,
      default: `mailto:${job.email}?subject=${subject}&body=${body}`
    };

    window.open(emailUrls[emailClient as keyof typeof emailUrls] || emailUrls.default, '_blank');
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow animate-fade-in bg-white border-indigo-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-indigo-900">{job.title}</h3>
          <div className="flex items-center text-gray-600 gap-4">
            <span className="flex items-center gap-1">
              <BuildingIcon className="w-4 h-4 text-indigo-400" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4 text-indigo-400" />
              {job.location}
            </span>
          </div>
        </div>
        <Badge variant={job.type === "premium" ? "default" : "secondary"} className={job.type === "premium" ? "bg-indigo-600" : ""}>
          {job.type === "premium" ? "Premium" : "Free"}
        </Badge>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              {format(job.postedAt, "d MMMM yyyy, HH:mm", { locale: el })}
            </div>
            <div className="text-indigo-600 font-medium">{daysLeft} ημέρες απομένουν</div>
          </div>
          {job.salary && <div className="font-semibold text-indigo-600">{job.salary}</div>}
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-indigo-400" />
            {job.phone}
          </div>
          <div className="flex items-center gap-2">
            <MailIcon className="w-4 h-4 text-indigo-400" />
            {job.email}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Button onClick={handleShare} variant="outline" className="flex-1 min-w-[120px] border-indigo-200 hover:border-indigo-300">
            <ShareIcon className="w-4 h-4 mr-2" />
            Κοινοποίηση
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex-1 min-w-[120px] bg-indigo-600 hover:bg-indigo-700">
                <SendIcon className="w-4 h-4 mr-2" />
                Αποστολή CV
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSendCV('gmail')}>
                Gmail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSendCV('outlook')}>
                Outlook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSendCV('yahoo')}>
                Yahoo Mail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSendCV('default')}>
                Άλλο email client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};