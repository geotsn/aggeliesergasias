import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export const JobPostForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Επιτυχής καταχώρηση!",
      description: "Η αγγελία σας δημοσιεύτηκε επιτυχώς.",
    });
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-2">
        <Label htmlFor="title">Τίτλος Θέσης</Label>
        <Input id="title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Εταιρεία</Label>
        <Input id="company" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Τοποθεσία</Label>
        <Input id="location" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Περιγραφή</Label>
        <Textarea id="description" required className="min-h-[150px]" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salary">Μισθός (προαιρετικό)</Label>
        <Input id="salary" />
      </div>

      <div className="space-y-2">
        <Label>Τύπος Αγγελίας</Label>
        <RadioGroup defaultValue="free" className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="free" />
            <Label htmlFor="free">Δωρεάν (15 ημέρες)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="premium" id="premium" />
            <Label htmlFor="premium">Premium (30 ημέρες)</Label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Υποβολή..." : "Δημοσίευση Αγγελίας"}
      </Button>
    </form>
  );
};