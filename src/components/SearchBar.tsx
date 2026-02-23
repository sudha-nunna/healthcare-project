import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export const SearchBar = ({ placeholder = "Search for doctors, hospitals, or lab tests...", onSearch }: SearchBarProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            name="search"
            type="text"
            placeholder={placeholder}
            className="pl-12 h-14 text-lg bg-card border-2 border-input focus:border-primary shadow-md"
          />
        </div>
        <Button type="submit" size="lg" className="h-14 px-8 shadow-md">
          Search
        </Button>
      </div>
    </form>
  );
};
