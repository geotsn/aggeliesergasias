
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface JobTypeSelectorProps {
  type: string;
  onTypeChange: (value: string) => void;
}

export const JobTypeSelector = ({ type, onTypeChange }: JobTypeSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label>{t('posting.type')}</Label>
      <RadioGroup 
        value={type} 
        onValueChange={onTypeChange}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="free" id="free" />
          <Label htmlFor="free">{t('free.posting')}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="premium" id="premium" />
          <Label htmlFor="premium">{t('premium.posting')}</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
