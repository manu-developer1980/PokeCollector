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
import { Search, Loader2 } from "lucide-react";
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
    <div className="w-full px-2 sm:px-4">
      <div className="flex flex-col gap-4">
        {/* Contenedor principal de los filtros */}
        <div className="flex flex-wrap gap-4">
          {/* Campo de búsqueda */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(1);
                  }
                }}
              />
            </div>
          </div>

          {/* Filtro de tipo */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Select
              value={type}
              onValueChange={setType}
            >
              <SelectTrigger>
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
          </div>

          {/* Ordenamiento */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="number_asc">Number (Low-High)</SelectItem>
                <SelectItem value="number_desc">Number (High-Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón de búsqueda */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Button
              onClick={() => handleSearch(1)}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Searching...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Search className="h-4 w-4 mr-2" />
                  <span>Search</span>
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Resultados y paginación */}
      <div className="mt-8 space-y-6 w-full">{children}</div>

      {shouldShowPagination && (
        <div className="w-full overflow-x-auto">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(page) => handleSearch(page)}
          />
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
