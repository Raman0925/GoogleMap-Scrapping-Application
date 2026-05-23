import React from 'react';
import { ScrapedItem } from '@/types/scraper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps {
  items: ScrapedItem[];
  searchFilter: string;
  setSearchFilter: (val: string) => void;
  onRequestSort: (key: keyof ScrapedItem) => void;
  onDownloadCSV: () => void;
  onDownloadJSON: () => void;
  totalScraped: number;
}

export const DataTable: React.FC<DataTableProps> = ({
  items,
  searchFilter,
  setSearchFilter,
  onRequestSort,
  onDownloadCSV,
  onDownloadJSON,
  totalScraped,
}) => {
  return (
    <Card className="glass-card">
      <div className="table-header-row">
        <div className="input-wrapper search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <Input
            type="text"
            className="form-input table-search-input"
            placeholder="Search results list..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        <div className="export-group">
          <Button variant="outline" size="sm" onClick={onDownloadCSV} disabled={totalScraped === 0} className="btn-secondary h-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-1 h-4 w-4">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onDownloadJSON} disabled={totalScraped === 0} className="btn-secondary h-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-1 h-4 w-4">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            JSON
          </Button>
        </div>
      </div>

      <div className="table-wrapper rounded-lg border border-glass overflow-hidden">
        {items.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <span>No business locations extracted yet or matches the search filter.</span>
          </div>
        ) : (
          <Table className="data-table">
            <TableHeader>
              <TableRow className="border-b border-glass hover:bg-transparent">
                <TableHead onClick={() => onRequestSort('name')} className="cursor-pointer hover:text-white select-none">Name</TableHead>
                <TableHead onClick={() => onRequestSort('rating')} className="cursor-pointer hover:text-white select-none">Rating</TableHead>
                <TableHead onClick={() => onRequestSort('category')} className="cursor-pointer hover:text-white select-none">Category</TableHead>
                <TableHead className="text-foreground">Address</TableHead>
                <TableHead className="text-foreground">Phone</TableHead>
                <TableHead className="text-foreground">Website</TableHead>
                <TableHead className="text-foreground">Links</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="border-b border-glass hover:bg-white/[0.02]">
                  <TableCell className="text-white py-3 table-cell-bold">{item.name}</TableCell>
                  <TableCell className="py-3">
                    {item.rating ? (
                      <span className="rating-badge">
                        {item.rating.toFixed(1)} 
                        <span className="table-cell-reviews">
                          ({item.reviewsCount})
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="badge">{item.category}</span>
                  </TableCell>
                  <TableCell title={item.address} className="py-3 text-gray-300 table-cell-ellipsis">
                    {item.address}
                  </TableCell>
                  <TableCell className="py-3 table-cell-phone">
                    {item.phone ? (
                      <span>{item.phone}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 table-cell-ellipsis">
                    {item.website ? (
                      <a href={item.website} target="_blank" rel="noopener noreferrer" className="table-link">
                        Visit Link
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    {item.mapsUrl ? (
                      <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer" className="table-link table-link-purple">
                        View on Maps
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
};
export default DataTable;
