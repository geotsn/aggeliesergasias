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
  phone: string;
  email: string;
  category: "plumber" | "office" | "driver" | "electrician" | "carpenter" | "painter" | "mechanic" | "chef" | "security" | "teacher" | "medical" | "agriculture" | "hairdresser" | "retail" | "technology" | "other";
}