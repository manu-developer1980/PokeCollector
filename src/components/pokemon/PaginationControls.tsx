import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationControlsProps) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(currentPage - 1, 2);
      let end = Math.min(start + 2, totalPages - 1);

      if (end === totalPages - 1) {
        start = end - 2;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-2 px-2 sm:px-4 w-full max-w-full overflow-x-auto">
      <p className="text-sm text-gray-600 text-center">
        Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalCount)} -{" "}
        {Math.min(currentPage * pageSize, totalCount)} de {totalCount} resultados
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
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNumber);
                }}
                isActive={currentPage === pageNumber}
              >
                {pageNumber}
              </PaginationLink>
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
                currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
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
