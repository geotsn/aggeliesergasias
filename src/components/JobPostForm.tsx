
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { JobFormFields } from "./job-post/JobFormFields";
import { JobTypeSelector } from "./job-post/JobTypeSelector";
import { useJobForm } from "./job-post/useJobForm";

export const JobPostForm = () => {
  const { t } = useTranslation();
  const {
    formData,
    loading,
    handleInputChange,
    handleSelectChange,
    handleTypeChange,
    handleSubmit
  } = useJobForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <JobFormFields
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
      />
      
      <JobTypeSelector
        type={formData.type}
        onTypeChange={handleTypeChange}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t('submitting') : formData.type === "premium" ? t('pay') : t('publish')}
      </Button>
    </form>
  );
};
