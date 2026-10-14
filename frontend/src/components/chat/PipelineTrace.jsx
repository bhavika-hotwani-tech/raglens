import React, { useState } from 'react';
import {
  GitCommit,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sparkles,
} from 'lucide-react';
import Badge from '../common/Badge';
import { formatLatency } from '../../utils/formatters';

export default function PipelineTrace({ trace = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!trace || trace.length === 0) return null;

  const totalLatency = trace.reduce((acc, step) => acc + (step.latencyMs || 0), 0);

  return (
    <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50/70 overflow-hidden text-xs">
      {/* Header bar / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-3 py-2 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
          <span className="font-semibold text-stone-800">
            Pipeline Trace
          </span>
          <span className="text-[11px] text-stone-500 font-mono">
            ({trace.length} stages • {formatLatency(totalLatency)})
          </span>
        </div>
        <div className="flex items-center gap-2 text-stone-400">
          <Badge variant="info" size="sm">
            {trace.every((s) => s.status === 'Passed' || s.status === 'Success')
              ? 'All Passed'
              : 'Active'}
          </Badge>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Collapsible Step Timeline */}
      {isOpen && (
        <div className="border-t border-stone-200 p-3 space-y-3 bg-white">
          <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {trace.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Step dot */}
                <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700">
                  <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                </div>

                <div className="rounded-md border border-stone-100 bg-stone-50/50 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900 text-xs">
                      {step.step}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatLatency(step.latencyMs)}</span>
                    </div>
                  </div>
                  {step.details && (
                    <p className="mt-1 text-[11px] text-stone-600 leading-relaxed font-normal">
                      {step.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
