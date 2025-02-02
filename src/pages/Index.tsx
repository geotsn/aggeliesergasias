import { useState } from "react";
import { JobCard } from "@/components/JobCard";
import { JobPostForm } from "@/components/JobPostForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchIcon, WrenchIcon, BuildingIcon, CarIcon } from "lucide-react";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Mock data - will be replaced with real data from kariera.gr
  const mockJobs = [
    {
      id: "1",
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "Αθήνα",
      description: "We are looking for a senior software engineer...",
      requirements: ["5+ years experience", "React", "Node.js"],
      salary: "€3000 - €4000",
      type: "premium" as const,
      postedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      phone: "+30 210 1234567",
      email: "jobs@techcorp.com",
      category: "office" as const
    },
    {
      id: "2",
      title: "Marketing Manager",
      company: "Creative Agency",
      location: "Θεσσαλονίκη",
      description: "Join our creative team as a marketing manager...",
      requirements: ["3+ years experience", "Digital Marketing"],
      type: "free" as const,
      postedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      phone: "+30 2310 765432",
      email: "hr@creative.gr",
      category: "office" as const
    },
  ];

  const filteredJobs = mockJobs.filter(job => 
    (!selectedCategory || job.category === selectedCategory) &&
    (!searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Αγγελίες Εργασίας
          </h1>
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Αναζήτηση αγγελιών..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
            >
              Όλες οι ειδικότητες
            </Button>
            <Button
              variant={selectedCategory === "plumber" ? "default" : "outline"}
              onClick={() => setSelectedCategory("plumber")}
            >
              <WrenchIcon className="w-4 h-4 mr-2" />
              Υδραυλικός
            </Button>
            <Button
              variant={selectedCategory === "office" ? "default" : "outline"}
              onClick={() => setSelectedCategory("office")}
            >
              <BuildingIcon className="w-4 h-4 mr-2" />
              Υπάλληλος Γραφείου
            </Button>
            <Button
              variant={selectedCategory === "driver" ? "default" : "outline"}
              onClick={() => setSelectedCategory("driver")}
            >
              <CarIcon className="w-4 h-4 mr-2" />
              Οδηγός
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">Αγγελίες</TabsTrigger>
            <TabsTrigger value="post">Καταχώρηση Αγγελίας</TabsTrigger>
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