import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  searchPlaceholder?: string;
  filterPlaceholder?: string;
  filterOptions: FilterOption[];
  className?: string;
}

const SearchAndFilter = ({
  searchTerm,
  onSearchChange,
  filterValue,
  onFilterChange,
  searchPlaceholder = "ค้นหาโครงการหรือสถานที่...",
  filterPlaceholder = "กรองข้อมูล",
  filterOptions,
  className = ""
}: SearchAndFilterProps) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder={searchPlaceholder}
          className="pl-10 h-12 bg-background border-border shadow-sm focus:ring-2 focus:ring-primary/20"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={filterValue} onValueChange={onFilterChange}>
        <SelectTrigger className="w-full h-12 bg-background border-border shadow-sm hover:bg-accent/10 focus:ring-2 focus:ring-primary/20">
          <SelectValue placeholder={filterPlaceholder} />
        </SelectTrigger>
        <SelectContent className="bg-background border-border shadow-lg z-50">
          {filterOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="cursor-pointer hover:bg-accent/10 focus:bg-accent/20"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchAndFilter;