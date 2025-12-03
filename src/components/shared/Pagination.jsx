import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-10 w-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {startPage > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            onClick={() => onPageChange(1)}
            className={`h-10 w-10 ${currentPage === 1 ? 'bg-[#D4AF37] hover:bg-[#D4AF37]/90' : ''}`}
          >
            1
          </Button>
          {startPage > 2 && <span className="text-slate-400 px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          onClick={() => onPageChange(page)}
          className={`h-10 w-10 ${currentPage === page ? 'bg-[#D4AF37] hover:bg-[#D4AF37]/90' : ''}`}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-slate-400 px-2">...</span>}
          <Button
            variant={currentPage === totalPages ? "default" : "outline"}
            onClick={() => onPageChange(totalPages)}
            className={`h-10 w-10 ${currentPage === totalPages ? 'bg-[#D4AF37] hover:bg-[#D4AF37]/90' : ''}`}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-10 w-10"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}