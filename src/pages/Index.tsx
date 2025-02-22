
import React from "react";
import { useState } from "react";
import { JobPostForm } from "@/components/JobPostForm";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchIcon, ChevronDownIcon, Facebook, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { JobListing } from "@/types/job";
import { JobCard } from "@/components/JobCard";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { categories } from "@/config/categories";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { t } = useTranslation();
  
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
  const pageTitle = `Job Sparkle Hub - ${t('jobs.title')} | ${selectedCategory !== 'all' && selectedCategory ? categories.find(c => c.id === selectedCategory)?.label : t('listings')}`;
  const pageDescription = `${t('search.placeholder')} ${selectedCategory !== 'all' && selectedCategory ? categories.find(c => c.id === selectedCategory)?.label : t('listings')}. ${filteredJobs.length} ${t('jobs.title').toLowerCase()}.`;

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
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-indigo-900">
                {t('jobs.title')}
              </h1>
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <a 
                  href="https://www.facebook.com/profile.php?id=61565350984901"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={24} />
                </a>
                <span 
                  className="text-gray-400 cursor-not-allowed"
                  title="Coming soon"
                  aria-label="Instagram (coming soon)"
                >
                  <Instagram size={24} />
                </span>
                <span 
                  className="text-gray-400 cursor-not-allowed"
                  title="Coming soon"
                  aria-label="TikTok (coming soon)"
                >
                  <MessageCircle size={24} />
                </span>
              </div>
            </div>
            <div className="relative mb-6">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
              <Input
                type="search"
                placeholder={t('search.placeholder')}
                className="pl-10 border-indigo-200 focus:border-indigo-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label={t('search.placeholder')}
              />
            </div>
            <nav aria-label={t('jobs.title')} className="flex justify-center">
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
                <DropdownMenuContent className="w-full md:w-[350px] bg-white shadow-lg border border-gray-200">
                  <ScrollArea className="h-[300px] w-full">
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
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </header>

        <main className="container mx-auto py-8" role="main">
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="bg-white">
              <TabsTrigger value="listings" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                {t('listings')}
              </TabsTrigger>
              <TabsTrigger value="post" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                {t('post.job')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8" role="status" aria-live="polite">{t('loading')}</div>
              ) : filteredJobs.length > 0 ? (
                <section aria-label={t('jobs.title')}>
                  {filteredJobs.map((job) => (
                    <article key={job.id}>
                      <JobCard job={job} />
                    </article>
                  ))}
                </section>
              ) : (
                <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
                  {t('no.results')}
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
