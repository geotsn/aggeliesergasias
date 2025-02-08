
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/config/categories";

export const JobPostForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    category: "",
    description: "",
    phone: "",
    email: "",
    salary: "",
    type: "free"
  });

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

  const handlePremiumPayment = async () => {
    localStorage.setItem('pendingJobPost', JSON.stringify(formData));
    window.location.href = "https://buy.stripe.com/14k9BR50e3s54vK000";
  };

  const validateForm = () => {
    const requiredFields = ['title', 'company', 'location', 'category', 'description', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία: ${missingFields.join(', ')}`);
    }

    if (formData.email && !formData.email.includes('@')) {
      throw new Error('Παρακαλώ εισάγετε ένα έγκυρο email');
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      throw new Error('Παρακαλώ εισάγετε ένα έγκυρο τηλέφωνο (10 ψηφία)');
    }
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

      // Adjust for GMT+2
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
        throw new Error(error.message || 'Υπήρξε ένα πρόβλημα με την καταχώρηση της αγγελίας');
      }

      toast({
        title: "Επιτυχής καταχώρηση!",
        description: "Η αγγελία σας δημοσιεύτηκε επιτυχώς.",
      });

      setFormData({
        title: "",
        company: "",
        location: "",
        category: "",
        description: "",
        phone: "",
        email: "",
        salary: "",
        type: "free"
      });

    } catch (error) {
      console.error("Error submitting job:", error);
      toast({
        title: "Σφάλμα!",
        description: error instanceof Error ? error.message : "Υπήρξε ένα πρόβλημα κατά την καταχώρηση της αγγελίας.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-2">
        <Label htmlFor="title">Τίτλος Θέσης</Label>
        <Input 
          id="title" 
          required 
          value={formData.title}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Εταιρεία</Label>
        <Input 
          id="company" 
          required 
          value={formData.company}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Τοποθεσία</Label>
        <Input 
          id="location" 
          required 
          value={formData.location}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Ειδικότητα</Label>
        <Select 
          required
          value={formData.category}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Επιλέξτε ειδικότητα" />
          </SelectTrigger>
          <SelectContent>
            {categories.filter(cat => cat.id !== "all").map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Περιγραφή</Label>
        <Textarea 
          id="description" 
          required 
          className="min-h-[150px]"
          value={formData.description}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Τηλέφωνο</Label>
        <Input 
          id="phone" 
          type="tel" 
          required 
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          required 
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salary">Μισθός</Label>
        <Input 
          id="salary"
          value={formData.salary}
          onChange={handleInputChange}
          placeholder="π.χ. 1000€"
        />
      </div>

      <div className="space-y-2">
        <Label>Τύπος Αγγελίας</Label>
        <RadioGroup 
          value={formData.type} 
          onValueChange={handleTypeChange}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="free" />
            <Label htmlFor="free">Δωρεάν (10 ημέρες)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="premium" id="premium" />
            <Label htmlFor="premium">Premium (30 ημέρες - €3.99)</Label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Υποβολή..." : formData.type === "premium" ? "Πληρωμή €3.99" : "Δημοσίευση Αγγελίας"}
      </Button>
    </form>
  );
};
