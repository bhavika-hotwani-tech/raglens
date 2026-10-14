import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Play,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { evalService } from '../services/evalService';
import EvaluationComparisonTable from '../components/eval/EvaluationComparisonTable';
import EvaluationCharts from '../components/eval/EvaluationCharts';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import { toast } from 'sonner';
import { formatDate } from '../utils/formatters';

export default function Evaluation() {
  const [evalData, setEvalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningEval, setRunningEval] = useState(false);
  const [evalProgress, setEvalProgress] = useState(0);

  useEffect(() => {
    async function loadResults() {
      try {
        const data = await evalService.getEvaluationResults();
        setEvalData(data);
      } catch {
        toast.error('Failed to load evaluation metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  const handleRunEvaluation = async () => {
    setRunningEval(true);
    setEvalProgress(10);
    const toastId = toast.loading('Running 250 benchmark evaluations via RAGAS critic...');

    try {
      const updated = await evalService.runEvaluation((progress) => {
        setEvalProgress(progress);
      });
      setEvalData(updated);
      toast.success('Evaluation suite completed! Precision and recall refreshed.', {
        id: toastId,
      });
    } catch {
      toast.error('Evaluation run interrupted.', { id: toastId });
    } finally {
      setRunningEval(false);
      setEvalProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Run Evaluation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Benchmark Suite
            </span>
            <span className="text-xs text-stone-500 font-mono">
              Dataset: {evalData?.summary?.datasetName || 'Legal-Medical-v2.4'}
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-stone-900">
            RAGAS & TruLens Quality Benchmarking
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Quantifiable comparison of Naive Vector RAG baseline against RAGLens Advanced Multi-Query Rerank Architecture.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={Play}
            loading={runningEval}
            onClick={handleRunEvaluation}
          >
            {runningEval ? `Evaluating (${evalProgress}%)` : 'Run Evaluation Suite'}
          </Button>
        </div>
      </div>

      {/* Evaluation Progress Bar if running */}
      {runningEval && (
        <Card className="p-4 border-emerald-200 bg-emerald-50/40">
          <div className="flex justify-between text-xs font-medium text-emerald-900 mb-1.5">
            <span>Executing automated critic evaluations on 250 test cases...</span>
            <span className="font-mono font-bold">{evalProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
            <div
              className="h-full bg-emerald-700 transition-all duration-300 rounded-full"
              style={{ width: `${evalProgress}%` }}
            />
          </div>
        </Card>
      )}

      {/* Comparison Table Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Architecture Quality Comparison</CardTitle>
            <CardDescription>
              Evaluated across 250 ground-truth questions with source passage verification
            </CardDescription>
          </div>
          <div className="text-right text-xs text-stone-500">
            <span>Last Evaluated: </span>
            <span className="font-mono font-medium text-stone-700">
              {evalData ? formatDate(evalData.summary?.evaluatedDate) : '-'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <EvaluationComparisonTable comparison={evalData?.comparison || []} />
          )}
        </CardContent>
      </Card>

      {/* Visual Charts Comparison */}
      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <EvaluationCharts
          chartData={evalData?.chartData || []}
          latencyBreakdown={evalData?.latencyBreakdown || []}
        />
      )}

      {/* Methodology Explainer */}
      <Card className="bg-stone-50/70 border-stone-200">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                Evaluation Methodology & Grounding Guardrails
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                RAGLens employs independent LLM evaluator critics adhering to the <strong>RAGAS</strong> (Retrieval Augmented Generation Assessment) framework. <strong>Faithfulness</strong> penalizes hallucinated statements unsupported by retrieved context. <strong>Context Precision</strong> assesses how efficiently relevant chunks are prioritized over irrelevant noise. <strong>Latency</strong> records the P95 total time elapsed across rewrite, multi-query vector expansion, cross-encoder reranking, and generation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
