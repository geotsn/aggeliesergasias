import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReCAPTCHA from "react-google-recaptcha";

export const JobPostForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaValue) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ επιβεβαιώστε ότι δεν είστε ρομπότ",
        variant: "destructive",
      });
      return;
    }
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
        <Label htmlFor="category">Ειδικότητα</Label>
        <Select required>
          <SelectTrigger>
            <SelectValue placeholder="Επιλέξτε ειδικότητα" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plumber">Υδραυλικός</SelectItem>
            <SelectItem value="office">Υπάλληλος Γραφείου</SelectItem>
            <SelectItem value="driver">Οδηγός</SelectItem>
            <SelectItem value="electrician">Ηλεκτρολόγος</SelectItem>
            <SelectItem value="carpenter">Ξυλουργός</SelectItem>
            <SelectItem value="painter">Ελαιοχρωματιστής</SelectItem>
            <SelectItem value="mechanic">Μηχανικός</SelectItem>
            <SelectItem value="chef">Μάγειρας</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="teacher">Εκπαιδευτικός</SelectItem>
            <SelectItem value="other">Άλλο</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Περιγραφή</Label>
        <Textarea id="description" required className="min-h-[150px]" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Τηλέφωνο</Label>
        <Input id="phone" type="tel" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required />
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

      <div className="flex justify-center my-4">
        <ReCAPTCHA
          sitekey="YOUR_RECAPTCHA_SITE_KEY"
          onChange={(value) => setCaptchaValue(value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading || !captchaValue}>
        {loading ? "Υποβολή..." : "Δημοσίευση Αγγελίας"}
      </Button>
    </form>
  );
};