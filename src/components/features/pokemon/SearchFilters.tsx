import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PokemonCardSearchParams, PokemonCard } from "@/types/pokemon";
import { Loader2, Search, Filter, X } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionPlan } from "@/lib/stripe";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import PaginationControls from "./PaginationControls";
import {
  SUPERTYPE_MAP,
  SUBTYPE_MAP,
  POKEMON_TYPES_MAP,
  PokemonType,
  CardSupertype,
  CardSubtype,
} from "../../../lib/constants";

interface SearchFiltersProps {
  sets?: { id: string; name: string }[];
  types?: string[];
  rarities?: string[];
  searchParams?: PokemonCardSearchParams;
  onSearchParamsChange?: (params: Partial<PokemonCardSearchParams>) => void;
  onSearch?: (params: PokemonCardSearchParams) => void;
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  children?: React.ReactNode;
  onAddToCollection?: (card: PokemonCard) => void;
  onAddToWishlist?: (card: PokemonCard) => void;
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
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState<PokemonType>("all");
  const [supertype, setSupertype] = useState<CardSupertype | "all">("all");
  const [subtype, setSubtype] = useState<CardSubtype | "all">("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedSet, setSelectedSet] = useState<string>("all");

  const { subscription } = useSubscription();
  const planType = (subscription?.plan_type?.toUpperCase() ||
    "APRENDIZ") as SubscriptionPlan;

  const totalPages = Math.ceil(totalCount / pageSize);
  const shouldShowPagination = totalCount > 0 && totalPages > 1;

  const handleSearch = (page: number = 1) => {
    const params: PokemonCardSearchParams = {
      pageSize,
      page,
    };

    // Build the query string based on subscription level
    let queryParts = [];

    if (searchTerm) {
      queryParts.push(`name:"${searchTerm}*"`);
    }

    // Basic (Apprentice): only name and type
    if (type !== "all") {
      queryParts.push(`type:${type}`);
    }

    // Set filter (available for all users)
    if (selectedSet && selectedSet !== "all") {
      queryParts.push(`set.id:${selectedSet}`);
    }

    // Trainer: adds rarity
    if (planType === "ENTRENADOR" || planType === "MAESTRO") {
      if (selectedRarity && selectedRarity !== "all") {
        queryParts.push(`rarity:"${selectedRarity}"`);
      }
    }

    // Master: adds supertype and subtype
    if (planType === "MAESTRO") {
      if (supertype !== "all") {
        queryParts.push(`supertype:"${supertype}"`);
      }
      if (subtype !== "all") {
        queryParts.push(`subtype:"${subtype}"`);
      }
    }

    if (queryParts.length > 0) {
      params.q = queryParts.join(" ");
    }
    // Si no hay filtros aplicados, no enviar el parámetro 'q' para obtener todas las cartas

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
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        {/* Contenedor principal de los filtros */}
        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
          {/* Campo de búsqueda y tipo (disponible para todos) */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={t("search.nameSearchPlaceholder")}
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

          {/* Filtro de tipos (disponible para todos) */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Select
              value={type}
              onValueChange={(value: PokemonType) => setType(value)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder={t("filters.pokemonType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                {Object.entries(POKEMON_TYPES_MAP).map(([value, _]) => (
                  <SelectItem
                    key={value}
                    value={value}
                  >
                    {t(`pokemonTypes.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Sets (disponible para todos) */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Select
              value={selectedSet}
              onValueChange={setSelectedSet}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder={t("filters.set")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("filters.allSets")}
                </SelectItem>
                {sets.map((set) => (
                  <SelectItem
                    key={set.id}
                    value={set.id}
                  >
                    {set.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Rareza (ENTRENADOR y MAESTRO) */}
          {(planType === "ENTRENADOR" || planType === "MAESTRO") && (
            <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
              <Select
                value={selectedRarity}
                onValueChange={setSelectedRarity}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder={t("filters.rarity")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.allRarities")}
                  </SelectItem>
                  {rarities.map((rarity) => (
                    <SelectItem
                      key={rarity}
                      value={rarity}
                    >
                      {t(
                        `cardRarities.${rarity
                          .replace(/\s+/g, "")
                          .replace(/-/g, "")}`,
                        rarity
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtros adicionales solo para MAESTRO */}
          {planType === "MAESTRO" && (
            <>
              <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
                <Select
                  value={supertype}
                  onValueChange={(value: CardSupertype | "all") =>
                    setSupertype(value)
                  }
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder={t("filters.supertype")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("filters.allSupertypes")}
                    </SelectItem>
                    {Object.entries(SUPERTYPE_MAP).map(([value, _]) => (
                      <SelectItem
                        key={value}
                        value={value}
                      >
                        {t(`cardSupertypes.${value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
                <Select
                  value={subtype}
                  onValueChange={(value: CardSubtype | "all") =>
                    setSubtype(value)
                  }
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder={t("filters.subtype")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("filters.allSubtypes")}
                    </SelectItem>
                    {Object.entries(SUBTYPE_MAP).map(([value, _]) => (
                      <SelectItem
                        key={value}
                        value={value}
                      >
                        {t(
                          `cardSubtypes.${value
                            .replace(/\s+/g, "")
                            .replace(/-/g, "")}`,
                          value
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Ordenamiento (disponible para todos) */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] min-w-[200px]">
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder={t("search.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">
                  {t("search.sortNameAsc")}
                </SelectItem>
                <SelectItem value="name_desc">
                  {t("search.sortNameDesc")}
                </SelectItem>
                <SelectItem value="number_asc">
                  {t("search.sortNumberAsc")}
                </SelectItem>
                <SelectItem value="number_desc">
                  {t("search.sortNumberDesc")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón de búsqueda */}
          <div className="flex-1 basis-full xs:basis-[calc(50%-8px)] lg:basis-auto min-w-[120px]">
            <Button
              className="w-full"
              onClick={() => handleSearch(1)}
              disabled={isLoading}
            >
              <Search className="mr-2 h-4 w-4" />
              {t("search.searchCards")}
            </Button>
          </div>
        </div>
        {shouldShowPagination && (
          <div className="mt-6">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={(page) => handleSearch(page)}
            />
          </div>
        )}
        {/* Resultados de búsqueda */}
        <div className="mt-4">
          {isLoading ? (
            <LoadingSpinner
              message={t("search.searching")}
              compact
            />
          ) : (
            children
          )}
        </div>

        {/* Paginación */}
        {shouldShowPagination && (
          <div className="mt-6">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={(page) => handleSearch(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
