import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { PokemonCardSearchParams } from "@/types/pokemon";

interface SearchFiltersProps {
  onSearch: (params: PokemonCardSearchParams) => void;
  sets?: { id: string; name: string }[];
  types?: string[];
  rarities?: string[];
  isLoading?: boolean;
}

const SearchFilters = ({
  onSearch,
  sets = [],
  types = [],
  rarities = [],
  isLoading = false,
}: SearchFiltersProps) => {
  const [searchParams, setSearchParams] = useState<PokemonCardSearchParams>({
    q: "",
    page: 1,
    pageSize: 20,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, q: e.target.value });
  };

  const handleSelectChange = (value: string, field: string) => {
    setSearchParams({ ...searchParams, [field]: value });
  };

  const handleSearch = () => {
    onSearch(searchParams);
  };

  // Handle Enter key press in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearchParams({ q: "", page: 1, pageSize: 20 });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search cards by name, text, or number"
            className="pl-9"
            value={searchParams.q}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleSearch}
          className="bg-red-600 hover:bg-red-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Searching...
            </>
          ) : (
            <>Search</>
          )}
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Set</label>
          <Select
            value={searchParams.set || ""}
            onValueChange={(value) => handleSelectChange(value, "set")}
            disabled={isLoading || sets.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="All sets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All sets</SelectItem>
              {sets.map((set) => (
                <SelectItem key={set.id} value={set.id}>
                  {set.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Type</label>
          <Select
            value={searchParams.types || ""}
            onValueChange={(value) => handleSelectChange(value, "types")}
            disabled={isLoading || types.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Rarity</label>
          <Select
            value={searchParams.rarity || ""}
            onValueChange={(value) => handleSelectChange(value, "rarity")}
            disabled={isLoading || rarities.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="All rarities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All rarities</SelectItem>
              {rarities.map((rarity) => (
                <SelectItem key={rarity} value={rarity}>
                  {rarity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            disabled={isLoading}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
