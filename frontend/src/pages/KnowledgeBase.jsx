import React, { useState, useEffect } from 'react';
import { documentService } from '../services/documentService';
import FileUploader from '../components/knowledge/FileUploader';
import DocumentTable from '../components/knowledge/DocumentTable';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { AlertTriangle, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch {
      toast.error('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadComplete = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      setDeleting(true);
      await documentService.deleteDocument(docToDelete.id);
      setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
      toast.success(`"${docToDelete.name}" removed from knowledge base.`);
      setDocToDelete(null);
    } catch {
      toast.error('Failed to delete document.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Ingestion Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Enterprise Document Ingestion</CardTitle>
              <CardDescription>
                Upload and index unstructured files (PDF, DOCX, TXT) into chunked vector embeddings.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FileUploader onUploadComplete={handleUploadComplete} />
        </CardContent>
      </Card>

      {/* Documents Repository Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Indexed Document Repository</CardTitle>
              <CardDescription>
                Active corpus used by the hybrid retrieval engine during grounded chat queries.
              </CardDescription>
            </div>
            <span className="text-xs font-mono text-stone-500 font-semibold bg-stone-100 px-2 py-1 rounded">
              {documents.length} Files Total
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentTable
            documents={documents}
            loading={loading}
            onRequestDelete={(doc) => setDocToDelete(doc)}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(docToDelete)}
        onClose={() => !deleting && setDocToDelete(null)}
        title="Remove Document from Knowledge Base"
        description="This action will delete all corresponding chunks and vector representations."
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              disabled={deleting}
              onClick={() => setDocToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={deleting}
              onClick={handleConfirmDelete}
            >
              Delete Document
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-stone-50 p-3.5 border border-stone-200">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-stone-900">
                Are you sure you want to delete this document?
              </p>
              <p className="text-xs text-stone-600 mt-1 break-all font-mono">
                {docToDelete?.name}
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Semantic search queries will no longer be able to reference the{' '}
                <span className="font-semibold">{docToDelete?.chunksCount} chunks</span>{' '}
                associated with this record.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
