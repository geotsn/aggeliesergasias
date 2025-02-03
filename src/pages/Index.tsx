import { useState, useEffect } from "react";
import { JobCard } from "@/components/JobCard";
import { JobPostForm } from "@/components/JobPostForm";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchIcon, WrenchIcon, BuildingIcon, CarIcon, ZapIcon, HammerIcon, PaintbrushIcon, Wrench, UtensilsIcon, ShieldCheckIcon, GraduationCapIcon, HeartPulseIcon, LeafIcon, ScissorsIcon, ShirtIcon, SmartphoneIcon, MoreHorizontalIcon, BriefcaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = [
    { id: "all", icon: BriefcaseIcon, label: "Όλες οι Αγγελίες" },
    { id: "plumber", icon: WrenchIcon, label: "Υδραυλικός" },
    { id: "office", icon: BuildingIcon, label: "Υπάλληλος Γραφείου" },
    { id: "driver", icon: CarIcon, label: "Οδηγός" },
    { id: "electrician", icon: ZapIcon, label: "Ηλεκτρολόγος" },
    { id: "carpenter", icon: HammerIcon, label: "Ξυλουργός" },
    { id: "painter", icon: PaintbrushIcon, label: "Ελαιοχρωματιστής" },
    { id: "mechanic", icon: Wrench, label: "Μηχανικός" },
    { id: "chef", icon: UtensilsIcon, label: "Μάγειρας" },
    { id: "security", icon: ShieldCheckIcon, label: "Security" },
    { id: "teacher", icon: GraduationCapIcon, label: "Εκπαιδευτικός" },
    { id: "medical", icon: HeartPulseIcon, label: "Ιατρικό Προσωπικό" },
    { id: "agriculture", icon: LeafIcon, label: "Γεωργία" },
    { id: "hairdresser", icon: ScissorsIcon, label: "Κομμωτής" },
    { id: "retail", icon: ShirtIcon, label: "Λιανική" },
    { id: "technology", icon: SmartphoneIcon, label: "Τεχνολογία" },
    { id: "other", icon: MoreHorizontalIcon, label: "Άλλο" }
  ];

  // Empty initial jobs array - will be populated from backend later
  const [mockJobs, setMockJobs] = useState([]);

  // Check and remove expired jobs
  useEffect(() => {
    const now = new Date();
    setMockJobs(prevJobs => {
      // Sort jobs: premium first, then by date
      return prevJobs
        .filter(job => new Date(job.expiresAt) > now)
        .sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === "premium" ? -1 : 1;
          }
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        });
    });
    
    const checkExpiry = setInterval(() => {
      setMockJobs(prevJobs => prevJobs.filter(job => new Date(job.expiresAt) > now));
    }, 60000); // Check every minute

    return () => clearInterval(checkExpiry);
  }, []);

  const filteredJobs = mockJobs.filter(job => 
    (selectedCategory === "all" || !selectedCategory || job.category === selectedCategory) &&
    (!searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
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
            />
          </div>
          <div className="h-[calc(100vh-300px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
            <div className="flex flex-col space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(prev => prev === category.id ? null : category.id)}
                    className={`flex items-center gap-2 px-3 py-2 w-full transition-all ${
                      selectedCategory === category.id
                        ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-300"
                        : "hover:bg-indigo-50 hover:text-indigo-600 border-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{category.label}</span>
                  </Button>
                );
              })}
            </div>
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
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
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