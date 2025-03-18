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
import {
  POKEMON_TYPES_MAP,
  SUPERTYPE_MAP,
  SUBTYPE_MAP,
  RARITY_MAP,
  type PokemonType,
  type CardSupertype,
  type CardSubtype,
  type CardRarity,
} from "@/lib/constants";

interface SearchFiltersProps {
  onSearch: (params: PokemonCardSearchParams) => void;
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  children?: React.ReactNode;
  onAddToCollection?: (card: PokemonCard) => void;
  onAddToWishlist?: (card: PokemonCard) => void;
  sets?: string[];
  types?: string[];
  rarities?: string[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  sets = [],
  types = [],
  rarities = [],
  onSearch,
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 20,
  children,
  onAddToCollection,
  onAddToWishlist,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState<PokemonType>("all");
  const [supertype, setSupertype] = useState<CardSupertype | "all">("all");
  const [subtype, setSubtype] = useState<CardSubtype | "all">("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");

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

    if (supertype !== "all") {
      queryParts.push(`supertype:"${supertype}"`);
    }

    if (subtype !== "all") {
      queryParts.push(`subtype:"${subtype}"`);
    }

    if (selectedRarity && selectedRarity !== "all") {
      queryParts.push(`rarity:"${selectedRarity}"`);
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
                placeholder="Buscar por nombre..."
                className="pl-9 w-full bg-white"
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

          {/* Filtro de tipos */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Select
              value={type}
              onValueChange={(value: PokemonType) => setType(value)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Tipo de Pokémon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(POKEMON_TYPES_MAP).map(([value, label]) => (
                  <SelectItem
                    key={value}
                    value={value}
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Supertipo */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Select
              value={supertype}
              onValueChange={(value: CardSupertype | "all") =>
                setSupertype(value)
              }
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Supertipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los supertipos</SelectItem>
                {Object.entries(SUPERTYPE_MAP).map(([value, label]) => (
                  <SelectItem
                    key={value}
                    value={value}
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Subtipo */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Select
              value={subtype}
              onValueChange={(value: CardSubtype | "all") => setSubtype(value)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Filtrar por subtipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los subtipos</SelectItem>
                {Object.entries(SUBTYPE_MAP).map(([value, label]) => (
                  <SelectItem
                    key={value}
                    value={value}
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Rareza */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Select
              value={selectedRarity}
              onValueChange={setSelectedRarity}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Rareza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las rarezas</SelectItem>
                {rarities.map((rarity) => (
                  <SelectItem
                    key={rarity}
                    value={rarity}
                  >
                    {RARITY_MAP[rarity as CardRarity] || rarity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ordenamiento */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Nombre (A-Z)</SelectItem>
                <SelectItem value="name_desc">Nombre (Z-A)</SelectItem>
                <SelectItem value="number_asc">Número (Menor-Mayor)</SelectItem>
                <SelectItem value="number_desc">Número (Mayor-Menor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón de búsqueda */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Button
              onClick={() => handleSearch(1)}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              Buscar Cartas
            </Button>
          </div>
        </div>
      </div>
      {/* Resultados y paginación */}
      {!isLoading && (
        <>
          <div className="mt-8 space-y-6 w-full">{children}</div>
          {shouldShowPagination && (
            <div className="w-full overflow-x-auto">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={handleSearch}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchFilters;
