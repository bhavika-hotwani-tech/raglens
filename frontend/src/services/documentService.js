import api from './api';
import { INITIAL_DOCUMENTS } from '../mocks/mockData';

export const USE_MOCK = false;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Keep in-memory cache of mock documents so user uploads & deletions persist during the session
let mockDocumentsCache = [...INITIAL_DOCUMENTS];

export const documentService = {
  /**
   * Fetch all knowledge base documents
   */
  async getDocuments() {
    if (USE_MOCK) {
      await delay(400);
      return [...mockDocumentsCache];
    }
    const response = await api.get('/documents');
    return response.data;
  },

  /**
   * Upload a new document file with simulated chunking progress
   */
  async uploadDocument(file, onProgress) {
    if (USE_MOCK) {
      // Simulate realistic upload progress: 20% -> 50% -> 80% -> 100%
      if (onProgress) onProgress(20);
      await delay(350);
      if (onProgress) onProgress(55);
      await delay(450);
      if (onProgress) onProgress(85);
      await delay(400);
      if (onProgress) onProgress(100);

      const isTxt = file.name.endsWith('.txt');
      const isDocx = file.name.endsWith('.docx');
      const docType = isTxt ? 'txt' : isDocx ? 'docx' : 'pdf';
      const approxChunks = Math.max(12, Math.floor(file.size / 18000));

      const newDoc = {
        id: 'doc-' + Math.random().toString(36).substring(2, 8),
        name: file.name,
        type: docType,
        size: file.size,
        status: 'Indexed',
        chunksCount: approxChunks,
        embeddingModel: 'text-embedding-3-large (3072d)',
        uploadedAt: new Date().toISOString(),
        category: 'Ingested Document',
        summary: `Extracted and indexed ${approxChunks} semantic chunks with Dense + BM25 indices.`,
      };

      mockDocumentsCache = [newDoc, ...mockDocumentsCache];
      return newDoc;
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  /**
   * Delete a document by its ID
   */
  async deleteDocument(id) {
    if (USE_MOCK) {
      await delay(400);
      mockDocumentsCache = mockDocumentsCache.filter((doc) => doc.id !== id);
      return { success: true, id };
    }

    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};
