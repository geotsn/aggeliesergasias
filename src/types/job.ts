export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: "free" | "premium";
  postedAt: Date;
  expiresAt: Date;
}