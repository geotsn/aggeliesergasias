
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

  const handlePremiumPayment = async () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const postedAt = new Date();
    postedAt.setHours(postedAt.getHours() + 2);

    // Αποθήκευση της αγγελίας με κατάσταση 'pending'
    const { data: jobData, error } = await supabase.from("jobs").insert([
      {
        ...formData,
        posted_at: postedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: false,
        source: "web",
        url: window.location.origin,
        payment_status: 'pending',
        type: 'premium'
      }
    ]).select().single();

    if (error) {
      console.error("Error saving pending job:", error);
      throw new Error(error.message || t('error'));
    }

    console.log("Created pending job:", jobData);

    if (!jobData?.id) {
      throw new Error("Failed to create job listing");
    }

    // Δημιουργία του reference ID για το Stripe
    const reference = {
      id: jobData.id,
      title: formData.title,
      company: formData.company
    };

    try {
      const response = await fetch(
        `${window.location.origin}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ reference })
        }
      );

      const { url, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      if (!url) {
        throw new Error('Failed to create checkout session');
      }

      console.log("Redirecting to Stripe Checkout:", url);
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      validateForm();

      if (formData.type === "premium") {
        await handlePremiumPayment();
        return;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (formData.type === 'premium' ? 30 : 10));

      const postedAt = new Date();
      postedAt.setHours(postedAt.getHours() + 2);

      const { error } = await supabase.from("jobs").insert([
        {
          ...formData,
          posted_at: postedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true,
          source: "web",
          url: window.location.origin,
          payment_status: 'completed'
        }
      ]);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || t('error'));
      }

      toast({
        title: "Επιτυχής καταχώρηση!",
        description: "Η αγγελία σας δημοσιεύτηκε επιτυχώς.",
      });

      setFormData(initialFormData);

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
