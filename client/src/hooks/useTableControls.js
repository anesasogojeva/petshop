import { useMemo, useState } from 'react';

/**
 * Adds search + pagination on top of an already-fetched array, without
 * touching how that array is fetched or mutated. Usage:
 *
 *   const { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage,
 *           pageRows, filteredCount } = useTableControls(rows, { searchKeys: ['name', 'email'] });
 *   ...
 *   pageRows.map(row => <TableRow key={row.id}>...)
 *   <TablePagination count={filteredCount} page={page} onPageChange={(_, p) => setPage(p)}
 *     rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))} />
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

export default function useTableControls(rows = [], { searchKeys = [], initialRowsPerPage = 10 } = {}) {
  const [search, setSearchRaw] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPageRaw] = useState(initialRowsPerPage);

  const setSearch = (value) => {
    setSearchRaw(value);
    setPage(0); // reset to first page whenever the query changes
  };

  const setRowsPerPage = (value) => {
    setRowsPerPageRaw(value);
    setPage(0);
  };

  const filteredRows = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return rows;
    const query = search.trim().toLowerCase();
    return rows.filter((row) =>
      searchKeys.some((key) => {
        const value = getNestedValue(row, key);
        return value != null && String(value).toLowerCase().includes(query);
      })
    );
  }, [rows, search, searchKeys]);

  const pageRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  return {
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    filteredRows,
    filteredCount: filteredRows.length,
    pageRows,
  };
}
