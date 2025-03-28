import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  // Ensure all values are numbers and have valid defaults
  const validCurrentPage = Number(currentPage) || 1;
  const validPageSize = Number(pageSize) || 20;
  const validTotalCount = Number(totalCount) || 0;

  // Calculate start and end items
  const startItem = Math.min(
    (validCurrentPage - 1) * validPageSize + 1,
    validTotalCount
  );
  const endItem = Math.min(validCurrentPage * validPageSize, validTotalCount);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, validCurrentPage - 1);
      let end = Math.min(totalPages - 1, validCurrentPage + 1);

      if (validCurrentPage <= 3) {
        end = 4;
      }
      if (validCurrentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push("ellipsis1");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("ellipsis2");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-2 px-2 sm:px-4 w-full max-w-full overflow-x-auto mb-6">
      {validTotalCount > 0 && (
        <p className="text-sm text-gray-600 text-center">
          {t("pagination.showing")} {startItem} - {endItem} {t("pagination.of")}{" "}
          {validTotalCount} {t("pagination.results")}
        </p>
      )}
      <Pagination className="max-w-full">
        <PaginationContent className="flex-wrap justify-center">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (validCurrentPage > 1) onPageChange(validCurrentPage - 1);
              }}
              className={`whitespace-nowrap ${
                validCurrentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }`}
            />
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
                  aria-label={`${t("pagination.goToPage")} ${pageNumber}`}
                  className={
                    pageNumber === validCurrentPage
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
                if (validCurrentPage < totalPages)
                  onPageChange(validCurrentPage + 1);
              }}
              className={`whitespace-nowrap ${
                validCurrentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationControls;
