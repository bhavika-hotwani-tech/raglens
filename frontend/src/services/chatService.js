import api from './api';
import { INITIAL_CONVERSATIONS } from '../mocks/mockData';

export const USE_MOCK = false;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let mockConversationsCache = [...INITIAL_CONVERSATIONS];

export const chatService = {
  /**
   * Fetch all conversation threads
   */
  async getConversations() {
    if (USE_MOCK) {
      await delay(300);
      return [...mockConversationsCache];
    }
    const response = await api.get('/conversations');
    return response.data;
  },

  /**
   * Fetch full conversation with message history
   */
  async getConversationById(id) {
    if (USE_MOCK) {
      await delay(200);
      const conv = mockConversationsCache.find((c) => c.id === id);
      if (!conv) {
        throw new Error('Conversation not found');
      }
      return { ...conv };
    }
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  /**
   * Create a new blank conversation
   */
  async createConversation(title = 'New Investigation') {
    if (USE_MOCK) {
      const newConv = {
        id: 'conv-' + Math.random().toString(36).substring(2, 9),
        title,
        updatedAt: new Date().toISOString(),
        messagesCount: 0,
        preview: 'No messages yet.',
        messages: [],
      };
      mockConversationsCache = [newConv, ...mockConversationsCache];
      return newConv;
    }
    const response = await api.post('/conversations', { title });
    return response.data;
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(id) {
    if (USE_MOCK) {
      mockConversationsCache = mockConversationsCache.filter((c) => c.id !== id);
      return { success: true };
    }
    const response = await api.delete(`/conversations/${id}`);
    return response.data;
  },

  /**
   * Stream a chat response.
   * In mock mode, this simulates real-time pipeline trace steps, token streaming, and citation payload.
   * In real mode, it calls SSE endpoint /chat.
   */
  async streamChat({
    conversationId,
    message,
    settings = {},
    onStep, // callback for pipeline steps
    onToken, // callback for stream text chunks
    onComplete, // callback when done with full sources and trace
    onError,
  }) {
    if (USE_MOCK) {
      try {
        // Step 1: Query Rewrite
        onStep?.({ step: 'Query Rewrite', status: 'Running', latencyMs: 0 });
        await delay(280);
        onStep?.({
          step: 'Query Rewrite',
          status: 'Passed',
          latencyMs: 19,
          details: `Expanded semantic terms for "${message.slice(0, 35)}..." with legal & technical synonym enrichment.`,
        });

        // Step 2: Multi-Query
        if (settings.hybridSearch !== false) {
          onStep?.({ step: 'Multi-Query Expansion', status: 'Running', latencyMs: 0 });
          await delay(320);
          onStep?.({
            step: 'Multi-Query Expansion',
            status: 'Passed',
            latencyMs: 38,
            details: 'Decomposed into 3 parallel sub-queries targeting contractual, procedural, and compliance clauses.',
          });
        }

        // Step 3: Hybrid Retrieval
        onStep?.({ step: 'Hybrid Retrieval (Dense + BM25)', status: 'Running', latencyMs: 0 });
        await delay(350);
        onStep?.({
          step: 'Hybrid Retrieval (Dense + BM25)',
          status: 'Passed',
          latencyMs: 61,
          details: `Retrieved top ${settings.topK ? settings.topK * 4 : 20} candidates via Cosine Similarity + BM25, merged via Reciprocal Rank Fusion.`,
        });

        // Step 4: Reranker
        if (settings.reranker !== false) {
          onStep?.({ step: 'Cross-Encoder Rerank', status: 'Running', latencyMs: 0 });
          await delay(300);
          onStep?.({
            step: 'Cross-Encoder Rerank',
            status: 'Passed',
            latencyMs: 44,
            details: `Scored candidates using BAAI/bge-reranker-large. Retained top ${settings.topK || 4} highest scoring passages.`,
          });
        }

        // Step 5: Generation (Stream simulated tokens)
        onStep?.({ step: 'Context Generation', status: 'Running', latencyMs: 0 });

        const simulatedResponseText = `Based on the indexed enterprise documentation (specifically **Master Services Agreement 2025** and the **Security Compliance Framework**):

1. **Governing Provisions & Interpretation:**
   The documentation outlines explicit operational guidelines regarding "${message.replace(/[?]/g, '')}". Key thresholds are enforced under Section 4 and Section 11 of the indexed compliance guidelines.

2. **Compliance & Procedural Guardrails:**
   * **Verification Requirements:** Mandatory dual-custody authorization is required before any policy exemptions take effect.
   * **Auditability & Traceability:** All queries and retrieval logs are immutably preserved in the audit index with cryptographic timestamps.
   * **Enforcement Timeline:** Standard resolution SLAs apply within thirty (30) business days unless designated an emergency P1 regulatory disclosure.

3. **Cross-Referenced Citations:**
   Review Section 11.2 for quantitative monetary liability exclusions and Section 14.3 for governing jurisdiction.`;

        // Stream tokens word by word with brief delays
        const words = simulatedResponseText.split(' ');
        let accumulated = '';
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? ' ' : '');
          accumulated += word;
          onToken?.(accumulated);
          await delay(25 + Math.random() * 20);
        }

        onStep?.({
          step: 'Context Generation',
          status: 'Passed',
          latencyMs: 230,
          details: 'Grounded generation completed using 1,450 context tokens.',
        });

        // Step 6: Self-Correction check
        if (settings.selfCorrection !== false) {
          onStep?.({ step: 'Self-Correction & Faithfulness Check', status: 'Running', latencyMs: 0 });
          await delay(250);
          onStep?.({
            step: 'Self-Correction & Faithfulness Check',
            status: 'Passed',
            latencyMs: 32,
            details: 'Critic verification passed. 0 hallucinated claims found. Faithfulness index: 0.98.',
          });
        }

        const sources = [
          {
            id: 'src-gen-1',
            docId: 'doc-101',
            docName: 'Master_Services_Agreement_Acme_Enterprise_2025.pdf',
            page: 19,
            chunkId: 'chk-101-062',
            score: 0.94,
            text: 'Section 4.3 Governance: Operational policies and liability allocations must adhere strictly to agreed enterprise service levels and audit validation standards.',
          },
          {
            id: 'src-gen-2',
            docId: 'doc-102',
            docName: 'SOC2_Type_II_Security_Compliance_Report_2024.pdf',
            page: 31,
            chunkId: 'chk-102-085',
            score: 0.88,
            text: 'Control Ref CC7.2: Access enforcement protocols and audit traceability ensure all administrative access events are time-stamped and verified against authorized role profiles.',
          },
        ];

        const pipelineTrace = [
          {
            step: 'Query Rewrite',
            status: 'Passed',
            latencyMs: 19,
            details: 'Syntactic parsing and query expansion with acronym resolution.',
          },
          {
            step: 'Multi-Query Expansion',
            status: 'Passed',
            latencyMs: 38,
            details: '3 distinct perspectives generated for vector matching.',
          },
          {
            step: 'Hybrid Retrieval (Dense + BM25)',
            status: 'Passed',
            latencyMs: 61,
            details: 'Combined Dense Cosine + Sparse BM25 via Reciprocal Rank Fusion.',
          },
          {
            step: 'Cross-Encoder Rerank',
            status: 'Passed',
            latencyMs: 44,
            details: 'Filtered out non-relevant context with BAAI/bge-reranker-large.',
          },
          {
            step: 'Context Generation',
            status: 'Passed',
            latencyMs: 230,
            details: 'Generated response grounded strictly in retrieved sources.',
          },
          {
            step: 'Self-Correction & Faithfulness Check',
            status: 'Passed',
            latencyMs: 32,
            details: 'Cross-checked assertions against citation chunks.',
          },
        ];

        const assistantMessage = {
          id: 'msg-' + Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: accumulated,
          timestamp: new Date().toISOString(),
          sources,
          pipelineTrace,
        };

        // Update local conversation cache
        const conv = mockConversationsCache.find((c) => c.id === conversationId);
        if (conv) {
          conv.messages.push({
            id: 'msg-' + Math.random().toString(36).substring(2, 9),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          });
          conv.messages.push(assistantMessage);
          conv.messagesCount = conv.messages.length;
          conv.updatedAt = new Date().toISOString();
        }

        onComplete?.(assistantMessage);
      } catch (err) {
        onError?.(err);
      }
      return;
    }

    // Real SSE implementation
    try {
      const response = await fetch(`${api.defaults.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('raglens_token')}`,
        },
        body: JSON.stringify({ conversationId, message, settings }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const event = JSON.parse(dataStr);
              if (event.type === 'step') onStep?.(event.data);
              if (event.type === 'token') onToken?.(event.data);
              if (event.type === 'complete') onComplete?.(event.data);
            } catch {
              // Ignore parse error on partial lines
            }
          }
        }
      }
    } catch (err) {
      onError?.(err);
    }
  },

  /**
   * Submit feedback (thumbs up / thumbs down) for an answer
   */
  async sendFeedback({ messageId, rating, comment = '' }) {
    if (USE_MOCK) {
      await delay(200);
      return { success: true, messageId, rating };
    }
    const response = await api.post('/feedback', { messageId, rating, comment });
    return response.data;
  },
};
