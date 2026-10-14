import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import Button from '../common/Button';
import { formatBytes } from '../../utils/formatters';
import { toast } from 'sonner';

export default function FileUploader({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeUploads, setActiveUploads] = useState([]);
  const fileInputRef = useRef(null);

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const handleFileSelection = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const isAllowed =
        allowedTypes.includes(file.type) ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.txt');
      if (!isAllowed) {
        toast.error(`"${file.name}" has an unsupported format. Please upload PDF, DOCX, or TXT.`);
      }
      return isAllowed;
    });

    if (validFiles.length === 0) return;

    validFiles.forEach((file) => startUpload(file));
  };

  const startUpload = async (file) => {
    const uploadId = 'up-' + Math.random().toString(36).substring(2, 9);
    const newUpload = {
      id: uploadId,
      name: file.name,
      size: file.size,
      progress: 0,
      stage: 'Uploading...',
      status: 'uploading', // 'uploading' | 'completed' | 'error'
    };

    setActiveUploads((prev) => [newUpload, ...prev]);

    try {
      const { documentService } = await import('../../services/documentService');
      const uploadedDoc = await documentService.uploadDocument(file, (percent) => {
        let stage = 'Uploading...';
        if (percent > 30 && percent < 70) stage = 'Parsing & Chunking...';
        if (percent >= 70 && percent < 100) stage = 'Computing 3072d Embeddings...';
        if (percent === 100) stage = 'Indexing Complete';

        setActiveUploads((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, progress: percent, stage } : u))
        );
      });

      setActiveUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId
            ? { ...u, progress: 100, stage: 'Indexed Successfully', status: 'completed' }
            : u
        )
      );

      toast.success(`"${file.name}" indexed successfully!`);
      if (onUploadComplete) onUploadComplete(uploadedDoc);
    } catch {
      setActiveUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId
            ? { ...u, stage: 'Ingestion failed', status: 'error' }
            : u
        )
      );
      toast.error(`Failed to ingest "${file.name}".`);
    }
  };

  const removeUploadItem = (id) => {
    setActiveUploads((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleFileSelection(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/60'
            : 'border-stone-300 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-400'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFileSelection(e.target.files);
            }
          }}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-2xs border border-stone-200 text-emerald-700 mb-3">
          <UploadCloud className="h-6 w-6 stroke-[1.75]" />
        </div>

        <p className="text-sm font-semibold text-stone-900">
          Click or drag enterprise documents to ingest
        </p>
        <p className="mt-1 text-xs text-stone-500">
          Supports contracts, audit reports, and guidelines (PDF, DOCX, TXT up to 50MB)
        </p>
      </div>

      {/* Per-file Progress List */}
      {activeUploads.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span>Recent Ingestion Queue ({activeUploads.length})</span>
            <button
              type="button"
              onClick={() => setActiveUploads([])}
              className="text-[11px] text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              Clear list
            </button>
          </div>

          <div className="space-y-2.5">
            {activeUploads.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-stone-100 bg-stone-50/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="h-4 w-4 text-stone-500 shrink-0" />
                    <div className="truncate">
                      <p className="truncate text-xs font-semibold text-stone-800">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {formatBytes(item.size)} • {item.stage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'uploading' && (
                      <span className="text-xs font-mono text-stone-600 font-medium">
                        {item.progress}%
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeUploadItem(item.id)}
                      className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {item.status === 'uploading' && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
