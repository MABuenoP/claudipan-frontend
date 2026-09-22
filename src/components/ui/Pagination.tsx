import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'registros',
  className = '',
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with windowing if needed
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl shadow-sm ${className}`}>
      <div className="text-xs text-stone-600 dark:text-stone-400 font-medium">
        Mostrando <strong className="text-stone-900 dark:text-stone-100">{startItem}</strong> - <strong className="text-stone-900 dark:text-stone-100">{endItem}</strong> de <strong className="text-stone-900 dark:text-stone-100">{totalItems}</strong> {itemLabel}
        <span className="ml-2 text-stone-400 dark:text-stone-600">|</span>
        <span className="ml-2">Página <strong className="text-stone-900 dark:text-stone-100">{currentPage}</strong> de <strong className="text-stone-900 dark:text-stone-100">{totalPages}</strong></span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
            currentPage === 1
              ? 'border-stone-200 dark:border-stone-800 text-stone-400 cursor-not-allowed opacity-50'
              : 'border-amber-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-500 cursor-pointer shadow-sm active:scale-95'
          }`}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-stone-400 select-none">
                ...
              </span>
            );
          }
          const pageNum = Number(page);
          const isCurrent = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center ${
                isCurrent
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-105'
                  : 'bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-400'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
            currentPage === totalPages
              ? 'border-stone-200 dark:border-stone-800 text-stone-400 cursor-not-allowed opacity-50'
              : 'border-amber-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-500 cursor-pointer shadow-sm active:scale-95'
          }`}
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
