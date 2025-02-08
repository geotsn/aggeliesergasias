
import { useState } from "react";
import { JobPostForm } from "@/components/JobPostForm";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  SearchIcon, 
  WrenchIcon, 
  BuildingIcon, 
  CarIcon, 
  ChefHatIcon,
  HeartPulseIcon,
  GraduationCapIcon,
  HardHatIcon,
  ShoppingBagIcon,
  UtensilsIcon,
  HomeIcon,
  TruckIcon,
  ScissorsIcon,
  ShirtIcon,
  ChevronDownIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { JobListing } from "@/types/job";
import { JobCard } from "@/components/JobCard";
import { Helmet } from "react-helmet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = [
    { id: "all", icon: SearchIcon, label: "Όλες οι Αγγελίες", description: "Δείτε όλες τις διαθέσιμες θέσεις εργασίας" },
    { id: "plumber", icon: WrenchIcon, label: "Υδραυλικός", description: "Θέσεις για υδραυλικούς" },
    { id: "office", icon: BuildingIcon, label: "Υπάλληλος Γραφείου", description: "Διοικητικές θέσεις εργασίας" },
    { id: "driver", icon: CarIcon, label: "Οδηγός", description: "Θέσεις για επαγγελματίες οδηγούς" },
    { id: "chef", icon: ChefHatIcon, label: "Μάγειρας", description: "Θέσεις στην μαγειρική" },
    { id: "medical", icon: HeartPulseIcon, label: "Ιατρικό Προσωπικό", description: "Θέσεις στον ιατρικό τομέα" },
    { id: "education", icon: GraduationCapIcon, label: "Εκπαίδευση", description: "Εκπαιδευτικές θέσεις" },
    { id: "construction", icon: HardHatIcon, label: "Οικοδομικά", description: "Θέσεις στις κατασκευές" },
    { id: "retail", icon: ShoppingBagIcon, label: "Πωλητής", description: "Θέσεις στις πωλήσεις" },
    { id: "service", icon: UtensilsIcon, label: "Εστίαση", description: "Θέσεις στην εστίαση" },
    { id: "cleaning", icon: HomeIcon, label: "Καθαριότητα", description: "Θέσεις καθαριότητας" },
    { id: "logistics", icon: TruckIcon, label: "Αποθήκη", description: "Θέσεις σε αποθήκες" },
    { id: "beauty", icon: ScissorsIcon, label: "Κομμωτική", description: "Θέσεις στην κομμωτική" },
    { id: "textile", icon: ShirtIcon, label: "Ραπτική", description: "Θέσεις στην ραπτική" }
  ];

  const fetchJobs = async () => {
    let query = supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("posted_at", { ascending: false });

    if (selectedCategory && selectedCategory !== "all") {
      query = query.eq("category", selectedCategory);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
    
    return data as JobListing[];
  };

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", selectedCategory],
    queryFn: fetchJobs
  });

  const filteredJobs = jobs.filter(job => 
    !searchTerm || 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "jobBoardName": "Job Sparkle Hub",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": filteredJobs.length
    }
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory) || categories[0];
  const pageTitle = `Job Sparkle Hub - Αγγελίες Εργασίας | ${selectedCategory !== 'all' && selectedCategory ? categories.find(c => c.id === selectedCategory)?.label : 'Όλες οι Θέσεις'}`;
  const pageDescription = `Αναζητήστε θέσεις εργασίας στην κατηγορία ${selectedCategory !== 'all' && selectedCategory ? categories.find(c => c.id === selectedCategory)?.label : 'όλες τις ειδικότητες'}. ${filteredJobs.length} διαθέσιμες θέσεις εργασίας.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <header className="bg-white shadow-md">
          <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold text-indigo-900 mb-4">
              Αγγελίες Εργασίας
            </h1>
            <div className="relative mb-6">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Αναζήτηση αγγελιών..."
                className="pl-10 border-indigo-200 focus:border-indigo-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Αναζήτηση αγγελιών"
              />
            </div>
            <nav aria-label="Κατηγορίες εργασίας" className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto bg-white">
                    <span className="flex items-center gap-2">
                      {React.createElement(selectedCategoryData.icon, { className: "w-5 h-5" })}
                      {selectedCategoryData.label}
                      <ChevronDownIcon className="w-4 h-4 ml-2" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full md:w-56 bg-white shadow-lg border border-gray-200">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <DropdownMenuItem
                        key={category.id}
                        className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
                          selectedCategory === category.id ? 'bg-indigo-50 text-indigo-600' : ''
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-gray-500">{category.description}</div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </header>

        <main className="container mx-auto py-8" role="main">
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="bg-white">
              <TabsTrigger value="listings" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Αγγελίες
              </TabsTrigger>
              <TabsTrigger value="post" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Καταχώρηση Αγγελίας
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8" role="status" aria-live="polite">Φόρτωση αγγελιών...</div>
              ) : filteredJobs.length > 0 ? (
                <section aria-label="Λίστα αγγελιών">
                  {filteredJobs.map((job) => (
                    <article key={job.id}>
                      <JobCard job={job} />
                    </article>
                  ))}
                </section>
              ) : (
                <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
                  Δεν βρέθηκαν αγγελίες με τα επιλεγμένα κριτήρια
                </div>
              )}
            </TabsContent>

            <TabsContent value="post">
              <JobPostForm />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Index;
