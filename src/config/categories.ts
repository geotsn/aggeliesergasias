
import { 
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
  SearchIcon
} from "lucide-react";

export const categories = [
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
