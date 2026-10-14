import React, { useState } from 'react';
import {
  FileText,
  Search,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../common/Table';
import Badge from '../common/Badge';
import Input from '../common/Input';
import EmptyState from '../common/EmptyState';
import { TableSkeleton } from '../common/Skeleton';
import { formatBytes, formatDate } from '../../utils/formatters';

export default function DocumentTable({
  documents = [],
  loading = false,
  onRequestDelete,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.category && doc.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === 'ALL' || doc.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Indexed':
        return (
          <Badge variant="success" dot size="sm">
            Indexed
          </Badge>
        );
      case 'Processing':
        return (
          <Badge variant="info" dot size="sm">
            Processing
          </Badge>
        );
      case 'Failed':
        return (
          <Badge variant="danger" dot size="sm">
            Failed
          </Badge>
        );
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search and Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by file name or category..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'INDEXED', 'PROCESSING', 'FAILED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer select-none ${
                statusFilter === st
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredDocs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents found"
            description={
              searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'Upload enterprise documents above to begin indexing semantic chunks.'
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Semantic Chunks</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-600 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900 text-sm truncate max-w-xs sm:max-w-md">
                          {doc.name}
                        </p>
                        <p className="text-xs text-stone-500 truncate max-w-xs sm:max-w-md">
                          {doc.category || 'Enterprise Document'} • {doc.embeddingModel}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(doc.status)}</TableCell>

                  <TableCell className="font-mono text-xs text-stone-600">
                    {formatBytes(doc.size)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-stone-700">
                      <Layers className="h-3.5 w-3.5 text-stone-400" />
                      <span>{doc.chunksCount} chunks</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-stone-500">
                    {formatDate(doc.uploadedAt)}
                  </TableCell>

                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => onRequestDelete(doc)}
                      title="Delete document"
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
