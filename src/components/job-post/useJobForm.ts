
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { JobFormData } from "./types";

const initialFormData: JobFormData = {
  title: "",
  company: "",
  location: "",
  category: "",
  description: "",
  phone: "",
  email: "",
  salary: "",
  type: "free"
};

export const useJobForm = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const validateForm = () => {
    const requiredFields = ['title', 'company', 'location', 'category', 'description', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`${t('error')}: ${missingFields.map(field => t(`${field}.label`)).join(', ')}`);
    }

    if (formData.email && !formData.email.includes('@')) {
      throw new Error(t('email.not.available'));
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      throw new Error('Παρακαλώ εισάγετε ένα έγκυρο τηλέφωνο (10 ψηφία)');
    }
  };

  const handlePremiumPayment = () => {
    const jobData = {
      ...formData,
      source: "web",
      url: window.location.origin
    };
    
    const stripeSessionUrl = `https://buy.stripe.com/14k9BR50e3s54vK000?client_reference_id=${encodeURIComponent(JSON.stringify(jobData))}`;
    window.location.href = stripeSessionUrl;
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      validateForm();

      if (formData.type === "premium") {
        handlePremiumPayment();
        return;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (formData.type === 'premium' ? 30 : 10));

      const postedAt = new Date();
      postedAt.setHours(postedAt.getHours() + 2);

      const { data, error } = await supabase.from("jobs").insert([
        {
          ...formData,
          posted_at: postedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true,
          source: "web",
          url: window.location.origin
        }
      ]).select();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || t('error'));
      }

      toast({
        title: "Επιτυχής καταχώρηση!",
        description: "Η αγγελία σας δημοσιεύτηκε επιτυχώς.",
      });

      resetForm();

    } catch (error) {
      console.error("Error submitting job:", error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleInputChange,
    handleSelectChange,
    handleTypeChange,
    handleSubmit
  };
};
