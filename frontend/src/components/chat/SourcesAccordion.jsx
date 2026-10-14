import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import Badge from '../common/Badge';
import { toast } from 'sonner';

export default function SourcesAccordion({ sources = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  if (!sources || sources.length === 0) return null;

  const handleCopyChunk = (source) => {
    navigator.clipboard.writeText(source.text);
    setCopiedId(source.id);
    toast.success(`Copied citation from ${source.docName}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mt-3 rounded-lg border border-stone-200 bg-white overflow-hidden text-xs">
      {/* Header Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-3 py-2 bg-stone-50/80 hover:bg-stone-100 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-stone-600 shrink-0" />
          <span className="font-semibold text-stone-800">
            Retrieved Sources & Citations
          </span>
          <span className="text-[11px] text-stone-500 font-mono">
            ({sources.length} passages cited)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-stone-400 font-medium">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-stone-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-stone-500" />
          )}
        </div>
      </button>

      {/* Citations List */}
      {isOpen && (
        <div className="divide-y divide-stone-100 border-t border-stone-200">
          {sources.map((source, index) => (
            <div key={source.id || index} className="p-3 hover:bg-stone-50/40 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span className="font-medium text-stone-900 truncate">
                    {source.docName}
                  </span>
                  {source.page && (
                    <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600 font-medium">
                      Page {source.page}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={source.score >= 0.85 ? 'success' : 'info'}
                    size="sm"
                  >
                    Score: {Number(source.score).toFixed(2)}
                  </Badge>

                  <button
                    type="button"
                    onClick={() => handleCopyChunk(source)}
                    title="Copy excerpt"
                    className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors cursor-pointer"
                  >
                    {copiedId === source.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Chunk quote excerpt */}
              <div className="mt-2 rounded bg-stone-50/80 border border-stone-200/80 p-2.5 text-[11px] text-stone-700 font-mono leading-relaxed">
                "{source.text}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
