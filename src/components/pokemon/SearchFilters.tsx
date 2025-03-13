import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { PokemonCardSearchParams } from "@/types/pokemon";
import PaginationControls from "./PaginationControls";

interface SearchFiltersProps {
  onSearch: (params: PokemonCardSearchParams) => void;
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  children?: React.ReactNode;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 20,
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");

  const totalPages = Math.ceil(totalCount / pageSize);
  const shouldShowPagination = totalCount > 0 && totalPages > 1;

  const handleSearch = (page: number = 1) => {
    const params: PokemonCardSearchParams = {
      pageSize,
      page,
    };

    // Build the query string
    let queryParts = [];

    if (searchTerm) {
      queryParts.push(`name:"${searchTerm}*"`);
    }

    if (type !== "all") {
      queryParts.push(`types:"${type}"`);
    }

    if (queryParts.length > 0) {
      params.q = queryParts.join(" ");
    }

    // Handle sorting
    switch (sortBy) {
      case "name_asc":
        params.orderBy = "name";
        break;
      case "name_desc":
        params.orderBy = "-name";
        break;
      case "number_asc":
        params.orderBy = "number";
        break;
      case "number_desc":
        params.orderBy = "-number";
        break;
    }

    onSearch(params);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(1);
            }}
          />
        </div>
        <Select
          value={type}
          onValueChange={setType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="fire">Fire</SelectItem>
            <SelectItem value="water">Water</SelectItem>
            <SelectItem value="electric">Electric</SelectItem>
            <SelectItem value="grass">Grass</SelectItem>
            <SelectItem value="ice">Ice</SelectItem>
            <SelectItem value="fighting">Fighting</SelectItem>
            <SelectItem value="poison">Poison</SelectItem>
            <SelectItem value="ground">Ground</SelectItem>
            <SelectItem value="flying">Flying</SelectItem>
            <SelectItem value="psychic">Psychic</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="rock">Rock</SelectItem>
            <SelectItem value="ghost">Ghost</SelectItem>
            <SelectItem value="dragon">Dragon</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="steel">Steel</SelectItem>
            <SelectItem value="fairy">Fairy</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={setSortBy}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            <SelectItem value="number_asc">Number (Low-High)</SelectItem>
            <SelectItem value="number_desc">Number (High-Low)</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => handleSearch(1)}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Searching...
            </span>
          ) : (
            <span className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search
            </span>
          )}
        </Button>
      </div>

      <div className="space-y-6">{children}</div>

      {shouldShowPagination && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => handleSearch(page)}
        />
      )}
    </div>
  );
};

export default SearchFilters;
