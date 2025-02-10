
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/config/categories";
import { useTranslation } from "react-i18next";
import { JobFormData } from "./types";

interface JobFormFieldsProps {
  formData: JobFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (value: string) => void;
}

export const JobFormFields = ({
  formData,
  handleInputChange,
  handleSelectChange,
}: JobFormFieldsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">{t('title.label')}</Label>
        <Input 
          id="title" 
          required 
          value={formData.title}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">{t('company.label')}</Label>
        <Input 
          id="company" 
          required 
          value={formData.company}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">{t('location.label')}</Label>
        <Input 
          id="location" 
          required 
          value={formData.location}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">{t('category.label')}</Label>
        <Select 
          required
          value={formData.category}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('select.specialty')} />
          </SelectTrigger>
          <SelectContent>
            {categories.filter(cat => cat.id !== "all").map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('description.label')}</Label>
        <Textarea 
          id="description" 
          required 
          className="min-h-[150px]"
          value={formData.description}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('phone.label')}</Label>
        <Input 
          id="phone" 
          type="tel" 
          required 
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('email.label')}</Label>
        <Input 
          id="email" 
          type="email" 
          required 
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salary">{t('salary.label')}</Label>
        <Input 
          id="salary"
          value={formData.salary}
          onChange={handleInputChange}
          placeholder={t('salary.placeholder')}
        />
      </div>
    </>
  );
};
