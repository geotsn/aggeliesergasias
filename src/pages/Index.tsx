import { useState } from "react";
import { JobCard } from "@/components/JobCard";
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
  ShirtIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { JobListing } from "@/types/job";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = [
    { id: "all", icon: SearchIcon, label: "Όλες οι Αγγελίες" },
    { id: "plumber", icon: WrenchIcon, label: "Υδραυλικός" },
    { id: "office", icon: BuildingIcon, label: "Υπάλληλος Γραφείου" },
    { id: "driver", icon: CarIcon, label: "Οδηγός" },
    { id: "chef", icon: ChefHatIcon, label: "Μάγειρας" },
    { id: "medical", icon: HeartPulseIcon, label: "Ιατρικό Προσωπικό" },
    { id: "education", icon: GraduationCapIcon, label: "Εκπαίδευση" },
    { id: "construction", icon: HardHatIcon, label: "Οικοδομικά" },
    { id: "retail", icon: ShoppingBagIcon, label: "Πωλητής" },
    { id: "service", icon: UtensilsIcon, label: "Εστίαση" },
    { id: "cleaning", icon: HomeIcon, label: "Καθαριότητα" },
    { id: "logistics", icon: TruckIcon, label: "Αποθήκη" },
    { id: "beauty", icon: ScissorsIcon, label: "Κομμωτική" },
    { id: "textile", icon: ShirtIcon, label: "Ραπτική" }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold text-indigo-900 mb-4">
            Αγγελίες Εργασίας
          </h1>
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Αναζήτηση αγγελιών..."
              className="pl-10 border-indigo-200 focus:border-indigo-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-indigo-100">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(prev => prev === category.id ? null : category.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 min-w-[120px] max-w-[150px] transition-all ${
                    selectedCategory === category.id
                      ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-300"
                      : "hover:bg-indigo-50 hover:text-indigo-600 border-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{category.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
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
              <div className="text-center py-8">Φόρτωση αγγελιών...</div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
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
  );
};

export default Index;