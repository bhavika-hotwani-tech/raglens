import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../common/Table';
import Badge from '../common/Badge';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function EvaluationComparisonTable({ comparison = [] }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-2xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow hover={false}>
            <TableHead className="w-1/3">Evaluation Metric</TableHead>
            <TableHead>Naive RAG (Baseline)</TableHead>
            <TableHead>Advanced RAG (RAGLens)</TableHead>
            <TableHead className="text-right">Performance Delta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparison.map((item, index) => {
            const isPercent = item.unit === '%';
            const naiveDisplay = isPercent
              ? `${(item.naive * 100).toFixed(1)}%`
              : `${item.naive}ms`;
            const advancedDisplay = isPercent
              ? `${(item.advanced * 100).toFixed(1)}%`
              : `${item.advanced}ms`;

            const isPositiveImprovement =
              item.direction === 'higher' ? item.delta > 0 : item.delta < 0;

            const deltaDisplay = isPercent
              ? `${item.delta > 0 ? '+' : ''}${(item.delta * 100).toFixed(1)}%`
              : `${item.delta > 0 ? '+' : ''}${item.delta}ms`;

            return (
              <TableRow key={index}>
                <TableCell>
                  <div>
                    <span className="font-semibold text-stone-900 text-sm">
                      {item.metric}
                    </span>
                    <p className="text-xs text-stone-500 mt-0.5 max-w-md">
                      {item.description}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-xs text-stone-600 font-medium">
                    {naiveDisplay}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200/60">
                    {advancedDisplay}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <Badge
                    variant={isPositiveImprovement ? 'success' : 'danger'}
                    size="sm"
                    className="font-mono"
                  >
                    <span className="flex items-center gap-1 font-semibold">
                      {isPositiveImprovement ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {deltaDisplay}
                    </span>
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
