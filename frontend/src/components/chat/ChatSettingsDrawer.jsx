import React from 'react';
import { X, Sliders, RotateCcw } from 'lucide-react';
import Button from '../common/Button';
import { toast } from 'sonner';

export default function ChatSettingsDrawer({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) {
  if (!isOpen) return null;

  const handleChange = (field, value) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    toast.success('Retrieval pipeline parameters updated');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl border-l border-stone-200 z-10 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-700" />
            <h3 className="font-semibold text-stone-900 text-sm">
              Retrieval & Generation Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Top-K Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-stone-800">
                Top-K Citations ({settings.topK})
              </label>
              <span className="text-xs font-mono text-stone-500">
                {settings.topK} chunks
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={settings.topK}
              onChange={(e) => handleChange('topK', Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <p className="mt-1 text-[11px] text-stone-500 leading-normal">
              Number of top ranked passages injected into the LLM context window.
            </p>
          </div>

          {/* Similarity Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-stone-800">
                Similarity Cutoff ({settings.similarityThreshold.toFixed(2)})
              </label>
              <span className="text-xs font-mono text-stone-500">
                {(settings.similarityThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.95"
              step="0.05"
              value={settings.similarityThreshold}
              onChange={(e) =>
                handleChange('similarityThreshold', parseFloat(e.target.value))
              }
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <p className="mt-1 text-[11px] text-stone-500 leading-normal">
              Minimum cosine/relevance score required for candidate consideration.
            </p>
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-4">
            {/* Cross-Encoder Reranker Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-800">
                  Cross-Encoder Reranker
                </p>
                <p className="text-[11px] text-stone-500">
                  Re-rank initial vector hits via BAAI/bge-reranker.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.reranker}
                onChange={(e) => handleChange('reranker', e.target.checked)}
                className="h-4 w-4 accent-emerald-700 rounded cursor-pointer"
              />
            </div>

            {/* Hybrid Retrieval Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-800">
                  Hybrid Search (Dense + BM25)
                </p>
                <p className="text-[11px] text-stone-500">
                  Fuses semantic vector search with keyword lexical matching.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.hybridSearch}
                onChange={(e) => handleChange('hybridSearch', e.target.checked)}
                className="h-4 w-4 accent-emerald-700 rounded cursor-pointer"
              />
            </div>

            {/* Self-Correction Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-800">
                  Self-Correction & Faithfulness
                </p>
                <p className="text-[11px] text-stone-500">
                  Hallucination checker audits generated claims against citations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.selfCorrection}
                onChange={(e) => handleChange('selfCorrection', e.target.checked)}
                className="h-4 w-4 accent-emerald-700 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Max Retries */}
          <div className="border-t border-stone-100 pt-4">
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Max Self-Correction Retries
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={settings.maxRetries}
              onChange={(e) => handleChange('maxRetries', parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <p className="mt-1 text-[11px] text-stone-500 leading-normal">
              Maximum feedback loops attempted if ground-truth consistency check fails.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={onResetSettings}
          >
            Reset
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
