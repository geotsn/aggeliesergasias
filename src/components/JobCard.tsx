
import { JobListing } from "@/types/job";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, BuildingIcon, ShareIcon, SendIcon, PhoneIcon, MailIcon, EuroIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format, isValid } from "date-fns";
import { el, enUS, de, es, zhCN, ru } from "date-fns/locale";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  
  const expirationDate = job.expires_at ? new Date(job.expires_at) : null;
  const postedDate = job.posted_at ? new Date(job.posted_at) : new Date();
  
  // Adjust for GMT+2 (Greek timezone)
  const adjustedPostedDate = new Date(postedDate.getTime() + (2 * 60 * 60 * 1000));
  
  const daysLeft = expirationDate 
    ? Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : 30;

  // Function to get the locale based on current language
  const getLocale = () => {
    switch (i18n.language) {
      case 'en':
        return enUS;
      case 'de':
        return de;
      case 'es':
        return es;
      case 'zh':
        return zhCN;
      case 'ru':
        return ru;
      default:
        return el;
    }
  };

  // Function to get the title in the current language
  const getLocalizedTitle = () => {
    switch (i18n.language) {
      case 'en':
        return job.title_en || job.title;
      case 'zh':
        return job.title_zh || job.title_en || job.title;
      case 'ru':
        return job.title_ru || job.title_en || job.title;
      case 'es':
        return job.title_es || job.title_en || job.title;
      case 'de':
        return job.title_de || job.title_en || job.title;
      default:
        return job.title;
    }
  };

  // Function to get the description in the current language
  const getLocalizedDescription = () => {
    switch (i18n.language) {
      case 'en':
        return job.description_en || job.description;
      case 'zh':
        return job.description_zh || job.description_en || job.description;
      case 'ru':
        return job.description_ru || job.description_en || job.description;
      case 'es':
        return job.description_es || job.description_en || job.description;
      case 'de':
        return job.description_de || job.description_en || job.description;
      default:
        return job.description;
    }
  };

  const displayTitle = getLocalizedTitle();
  const displayDescription = getLocalizedDescription();

  const handleShare = async () => {
    try {
      await navigator.share({
        title: displayTitle,
        text: `${job.company} is hiring: ${displayTitle}`,
        url: window.location.href,
      });
    } catch (err) {
      toast({
        title: t('share.copied'),
        description: t('share.description'),
      });
    }
  };

  const handleSendCV = (emailClient: string) => {
    if (!job.email) {
      toast({
        title: t('error'),
        description: t('email.not.available'),
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent(`Application for ${displayTitle} position`);
    const body = encodeURIComponent(`Dear ${job.company},\n\nI am interested in the ${displayTitle} position.\n\nBest regards`);
    
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
          <h3 className="text-xl font-semibold mb-2 text-indigo-900">{displayTitle}</h3>
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
      
      <p className="text-gray-600 mb-4 line-clamp-3">{displayDescription}</p>

      {job.salary && (
        <div className="flex items-center gap-2 text-indigo-600 font-medium mb-4">
          <EuroIcon className="w-4 h-4" />
          {job.salary}
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              {isValid(adjustedPostedDate) ? format(adjustedPostedDate, "d MMMM yyyy, HH:mm", { locale: getLocale() }) : t('date.not.available')}
            </div>
            <div className="text-indigo-600 font-medium">
              {daysLeft > 0 ? t('days.remaining', { count: daysLeft }) : t('expired')}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-600">
          {job.phone && (
            <div className="flex items-center gap-2 break-all">
              <PhoneIcon className="w-4 h-4 text-indigo-400 shrink-0" />
              {job.phone}
            </div>
          )}
          {job.email && (
            <div className="flex items-center gap-2 break-all">
              <MailIcon className="w-4 h-4 text-indigo-400 shrink-0" />
              {job.email}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Button onClick={handleShare} variant="outline" className="flex-1 min-w-[120px] border-indigo-200 hover:border-indigo-300">
            <ShareIcon className="w-4 h-4 mr-2" />
            {t('share')}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex-1 min-w-[120px] bg-indigo-600 hover:bg-indigo-700">
                <SendIcon className="w-4 h-4 mr-2" />
                {t('send.cv')}
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
                {t('other.email.client')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};
