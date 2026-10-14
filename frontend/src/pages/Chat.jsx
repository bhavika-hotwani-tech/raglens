import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Plus,
  Send,
  Sliders,
  Sparkles,
  Search,
  Trash2,
  Clock,
  StopCircle,
  Bot,
  User,
} from 'lucide-react';
import { chatService } from '../services/chatService';
import MessageItem from '../components/chat/MessageItem';
import ChatSettingsDrawer from '../components/chat/ChatSettingsDrawer';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { toast } from 'sonner';

const DEFAULT_SETTINGS = {
  topK: 5,
  similarityThreshold: 0.7,
  reranker: true,
  hybridSearch: true,
  selfCorrection: true,
  maxRetries: 2,
};

const SUGGESTIONS = [
  'What are the data retention and purging SLAs in Section 2?',
  'What are the 3 risk classifications of AI systems?',
  'What is the minimum acceptable faithfulness benchmark threshold?',
  'What is the escalation timeline for a Severity 1 incident?',
];

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [currentPipelineStep, setCurrentPipelineStep] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Load initial conversation threads
  useEffect(() => {
    async function loadThreads() {
      try {
        const threads = await chatService.getConversations();
        setConversations(threads);
        if (threads.length > 0 && !activeConvId) {
          setActiveConvId(threads[0].id);
        }
      } catch {
        toast.error('Failed to load conversation history.');
      }
    }
    loadThreads();
  }, []);

  // Load active conversation details when selection changes
  useEffect(() => {
    if (!activeConvId) return;
    async function loadDetails() {
      try {
        const conv = await chatService.getConversationById(activeConvId);
        setActiveConversation(conv);
        setMessages(conv.messages || []);
      } catch {
        toast.error('Failed to load conversation.');
      }
    }
    loadDetails();
  }, [activeConvId]);

  const handleCreateNewChat = async () => {
    try {
      const newConv = await chatService.createConversation('New Investigation');
      setConversations([newConv, ...conversations]);
      setActiveConvId(newConv.id);
      setActiveConversation(newConv);
      setMessages([]);
      setInputPrompt('');
      toast.success('Started a new grounded chat session.');
    } catch {
      toast.error('Could not create new session.');
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await chatService.deleteConversation(convId);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (activeConvId === convId) {
        if (remaining.length > 0) {
          setActiveConvId(remaining[0].id);
        } else {
          setActiveConvId(null);
          setActiveConversation(null);
          setMessages([]);
        }
      }
      toast.success('Conversation thread deleted.');
    } catch {
      toast.error('Failed to delete conversation.');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isStreaming) return;

    // If no conversation currently selected, create one
    let targetConvId = activeConvId;
    if (!targetConvId) {
      const newConv = await chatService.createConversation(prompt.slice(0, 30) + '...');
      setConversations([newConv, ...conversations]);
      setActiveConvId(newConv.id);
      targetConvId = newConv.id;
    }

    const userMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsStreaming(true);
    setCurrentPipelineStep({ step: 'Initializing Pipeline', status: 'Running' });
    setStreamingMessage({
      id: 'stream-temp',
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      sources: [],
      pipelineTrace: [],
    });

    try {
      await chatService.streamChat({
        conversationId: targetConvId,
        message: prompt,
        settings,
        onStep: (stepInfo) => {
          setCurrentPipelineStep(stepInfo);
        },
        onToken: (accumulatedText) => {
          setStreamingMessage((prev) => ({
            ...prev,
            content: accumulatedText,
          }));
        },
        onComplete: (finalMessage) => {
          setMessages((prev) => [...prev, finalMessage]);
          setStreamingMessage(null);
          setIsStreaming(false);
          setCurrentPipelineStep(null);
        },
        onError: (err) => {
          toast.error('Retrieval error: ' + (err.message || 'Stream interrupted'));
          setIsStreaming(false);
          setStreamingMessage(null);
          setCurrentPipelineStep(null);
        },
      });
    } catch (err) {
      toast.error('Failed to communicate with RAG engine.');
      setIsStreaming(false);
      setStreamingMessage(null);
      setCurrentPipelineStep(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-6rem)] rounded-xl border border-stone-200 bg-white shadow-2xs overflow-hidden">
      {/* Left Sidebar: Conversations Thread List */}
      <div className="hidden md:flex w-72 flex-col border-r border-stone-200 bg-stone-50/60">
        {/* New Chat Header */}
        <div className="p-3 border-b border-stone-200 space-y-2">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            className="w-full justify-start"
            onClick={handleCreateNewChat}
          >
            New Grounded Chat
          </Button>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-400">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`group flex items-center justify-between rounded-lg p-2.5 text-xs cursor-pointer transition-colors ${
                  activeConvId === c.id
                    ? 'bg-white shadow-2xs border border-stone-200/80 font-semibold text-stone-900'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare
                    className={`h-3.5 w-3.5 shrink-0 ${
                      activeConvId === c.id ? 'text-emerald-700' : 'text-stone-400'
                    }`}
                  />
                  <span className="truncate">{c.title}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDeleteConversation(e, c.id)}
                  title="Delete thread"
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded transition-opacity cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Center Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white min-w-0">
        {/* Chat Header Bar */}
        <div className="flex h-14 items-center justify-between border-b border-stone-200 px-4 sm:px-6 bg-stone-50/40">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-stone-900 text-sm truncate">
              {activeConversation?.title || 'Knowledge Base Inquiry'}
            </span>
            <div className="hidden sm:flex items-center gap-1.5">
              <Badge variant="success" size="sm">
                Hybrid + Reranker
              </Badge>
              <Badge variant="info" size="sm">
                Top-K: {settings.topK}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={Sliders}
              onClick={() => setSettingsOpen(true)}
            >
              Retrieval Settings
            </Button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !streamingMessage ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3 shadow-2xs">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-stone-900">
                Grounded Enterprise Retrieval
              </h3>
              <p className="mt-1 text-xs text-stone-500 max-w-md">
                Ask questions against indexed MSAs, clinical guidelines, and HR policies. Answers include exact chunk citations and execution trace metrics.
              </p>

              {/* Sample Prompt Chips */}
              <div className="mt-6 w-full max-w-lg space-y-2 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Sample Enterprise Inquiries:
                </p>
                {SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item)}
                    className="w-full text-left rounded-lg border border-stone-200 bg-stone-50/70 p-3 text-xs text-stone-700 hover:bg-stone-100 hover:border-stone-300 transition-colors cursor-pointer"
                  >
                    "{item}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {messages.map((msg, index) => (
                <MessageItem
                  key={msg.id || index}
                  message={msg}
                  isLastAssistant={index === messages.length - 1 && msg.role === 'assistant'}
                />
              ))}

              {/* Streaming Assistant Message with Live Typing */}
              {streamingMessage && (
                <div className="py-5 px-4 sm:px-6 bg-white">
                  <div className="mx-auto max-w-3xl flex gap-3 sm:gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-2xs shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-900">
                          RAGLens Assistant
                        </span>
                        {currentPipelineStep && (
                          <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200/60 animate-pulse">
                            <Clock className="h-3 w-3" />
                            {currentPipelineStep.step}
                          </span>
                        )}
                      </div>

                      <div className="prose prose-stone text-sm text-stone-800 leading-relaxed font-sans whitespace-pre-wrap">
                        {streamingMessage.content}
                        <span className="inline-block w-1.5 h-4 ml-0.5 bg-emerald-700 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Box Bottom Bar */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/50">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-xl border border-stone-300 bg-white shadow-xs focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-all">
              <textarea
                ref={textareaRef}
                rows={2}
                placeholder="Ask about contract indemnifications, HIPAA timelines, or clinical endpoints..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                className="w-full resize-none border-0 bg-transparent px-3.5 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
              />

              <div className="flex items-center justify-between px-3 py-2 border-t border-stone-100">
                <span className="text-[11px] text-stone-400">
                  Press <kbd className="font-mono text-stone-500">Enter</kbd> to submit, <kbd className="font-mono text-stone-500">Shift + Enter</kbd> for newline
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={!inputPrompt.trim() || isStreaming}
                  onClick={() => handleSendMessage()}
                  icon={Send}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Drawer */}
      <ChatSettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onResetSettings={() => {
          setSettings(DEFAULT_SETTINGS);
          toast.success('Reset settings to default parameters');
        }}
      />
    </div>
  );
}
