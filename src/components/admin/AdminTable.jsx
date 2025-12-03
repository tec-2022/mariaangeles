import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminTable({ 
  data = [], 
  columns, 
  renderRow, 
  searchFields = [],
  filterOptions = [],
  itemsPerPageOptions = [10, 25, 50],
  defaultSort = null
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState(defaultSort || { key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

  // Filter data
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Apply search
    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        searchFields.some(field => 
          item[field]?.toString().toLowerCase().includes(query)
        )
      );
    }
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter(item => item[key] === value);
      }
    });
    
    return result;
  }, [data, searchQuery, searchFields, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({});
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || Object.values(filters).some(v => v && v !== "all");

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {searchFields.length > 0 && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9"
            />
          </div>
        )}
        
        {filterOptions.map((filter) => (
          <Select 
            key={filter.key} 
            value={filters[filter.key] || "all"} 
            onValueChange={(v) => handleFilterChange(filter.key, v)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
            <X className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        )}
        
        <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
          <span>{sortedData.length} resultados</span>
        </div>
      </div>

      {/* Column Headers for sorting */}
      {columns && columns.length > 0 && (
        <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-600">
          {columns.map((col) => (
            <button
              key={col.key}
              onClick={() => col.sortable && handleSort(col.key)}
              className={`flex items-center gap-1 ${col.sortable ? 'cursor-pointer hover:text-[#0A2540]' : ''} ${col.className || ''}`}
              disabled={!col.sortable}
            >
              {col.label}
              {col.sortable && sortConfig.key === col.key && (
                sortConfig.direction === 'asc' 
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Data Rows */}
      <div className="space-y-3">
        {paginatedData.map((item, index) => renderRow(item, index))}
        
        {paginatedData.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No se encontraron resultados
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Mostrar</span>
            <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((n) => (
                  <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-[#0A2540]" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <span className="text-sm text-slate-500">
            Página {currentPage} de {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}