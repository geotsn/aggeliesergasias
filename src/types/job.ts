
export interface JobListing {
  id: string;
  title: string;
  title_en?: string;
  title_zh?: string;
  title_ru?: string;
  title_es?: string;
  title_de?: string;
  company: string;
  location: string;
  type: "free" | "premium";
  description: string;
  description_en?: string;
  description_zh?: string;
  description_ru?: string;
  description_es?: string;
  description_de?: string;
  salary?: string;
  posted_at: string;
  source: string;
  url: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  category?: string;
  expires_at?: string;
}
