import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Bot,
  User,
  Sparkles,
} from 'lucide-react';
import SourcesAccordion from './SourcesAccordion';
import PipelineTrace from './PipelineTrace';
import { toast } from 'sonner';
import { chatService } from '../../services/chatService';

export default function MessageItem({ message, isLastAssistant = false }) {
  const isAssistant = message.role === 'assistant';
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null
  const [copied, setCopied] = useState(false);

  const handleFeedback = async (type) => {
    if (feedback === type) return;
    setFeedback(type);
    try {
      await chatService.sendFeedback({
        messageId: message.id,
        rating: type,
      });
      toast.success(
        type === 'up'
          ? 'Marked as helpful. Grounding model reinforced!'
          : 'Feedback recorded. Flagged for retrieval review.'
      );
    } catch {
      toast.error('Could not submit feedback.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Answer copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`py-5 px-4 sm:px-6 transition-colors ${
        isAssistant ? 'bg-white' : 'bg-stone-50/50'
      }`}
    >
      <div className="mx-auto max-w-3xl flex gap-3 sm:gap-4">
        {/* Avatar icon */}
        <div className="shrink-0">
          {isAssistant ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-2xs">
              <Bot className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-200 text-stone-700 shadow-2xs">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Message body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold text-stone-900">
              {isAssistant ? 'RAGLens Assistant' : 'You'}
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              {message.timestamp
                ? new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </span>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-stone max-w-none text-sm leading-relaxed text-stone-800 break-words">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-stone-700">{children}</li>,
                h1: ({ children }) => <h1 className="text-base font-bold text-stone-900 mt-4 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-stone-900 mt-3 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xs font-bold text-stone-900 mt-2 mb-1">{children}</h3>,
                code: ({ children, inline }) =>
                  inline ? (
                    <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs text-stone-800">
                      {children}
                    </code>
                  ) : (
                    <pre className="rounded-lg bg-stone-900 p-3 font-mono text-xs text-stone-100 overflow-x-auto mb-3">
                      <code>{children}</code>
                    </pre>
                  ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-emerald-600 pl-3 italic text-stone-600 my-2">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Citations / Sources Accordion */}
          {isAssistant && message.sources && message.sources.length > 0 && (
            <SourcesAccordion sources={message.sources} />
          )}

          {/* Pipeline Trace Collapsible */}
          {isAssistant && message.pipelineTrace && message.pipelineTrace.length > 0 && (
            <PipelineTrace trace={message.pipelineTrace} />
          )}

          {/* Assistant Actions Bar: Copy, Thumbs Up, Thumbs Down */}
          {isAssistant && (
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy full response"
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleFeedback('up')}
                  title="Accurate and grounded"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    feedback === 'up'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback('down')}
                  title="Inaccurate or ungrounded"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    feedback === 'down'
                      ? 'bg-rose-100 text-rose-800'
                      : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
