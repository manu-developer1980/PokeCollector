import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
}: PaginationControlsProps) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Si hay menos páginas que el máximo visible, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      pages.push(1);

      // Calcular el rango de páginas alrededor de la página actual
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Ajustar si estamos cerca del inicio o final
      if (currentPage <= 3) {
        end = 4;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Añadir elipsis si es necesario
      if (start > 2) {
        pages.push("ellipsis1");
      }

      // Añadir páginas del rango
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Añadir elipsis final si es necesario
      if (end < totalPages - 1) {
        pages.push("ellipsis2");
      }

      // Siempre mostrar la última página
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col items-center gap-2 px-2 sm:px-4 w-full max-w-full overflow-x-auto mb-6">
      <p className="text-sm text-gray-600 text-center">
        Mostrando {startItem} - {endItem} de {totalCount} resultados
      </p>
      <Pagination className="max-w-full">
        <PaginationContent className="flex-wrap justify-center">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={`whitespace-nowrap ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Anterior
            </PaginationPrevious>
          </PaginationItem>

          {getPageNumbers().map((pageNumber, index) => (
            <PaginationItem key={`${pageNumber}-${index}`}>
              {pageNumber === "ellipsis1" || pageNumber === "ellipsis2" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(pageNumber as number);
                  }}
                  className={
                    pageNumber === currentPage
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : ""
                  }
                >
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={`whitespace-nowrap ${
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            >
              Siguiente
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationControls;
