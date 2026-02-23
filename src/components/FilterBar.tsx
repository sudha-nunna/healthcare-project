import { DollarSign, Star, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  specialty?: string;
  onSpecialtyChange?: (v: string) => void;
  rating?: string;
  onRatingChange?: (v: string) => void;
  onClear?: () => void;
}

export const FilterBar = ({ specialty = "", onSpecialtyChange, rating = "", onRatingChange, onClear }: FilterBarProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center">
      <div className="flex items-center gap-2">
        <Stethoscope className="h-4 w-4 text-primary" />
        <Select value={specialty || "all"} onValueChange={(v) => onSpecialtyChange?.(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            <SelectItem value="Cardiologist">Cardiology</SelectItem>
            <SelectItem value="Dermatologist">Dermatology</SelectItem>
            <SelectItem value="Orthopedist">Orthopedics</SelectItem>
            <SelectItem value="Pediatrician">Pediatrics</SelectItem>
            <SelectItem value="General Physician">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-primary" />
        <Select value={rating || "all"} onValueChange={(v) => onRatingChange?.(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={onClear}>Clear Filters</Button>
    </div>
  );
};
