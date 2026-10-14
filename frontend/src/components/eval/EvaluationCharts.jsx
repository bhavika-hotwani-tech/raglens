import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';

export default function EvaluationCharts({ chartData = [], latencyBreakdown = [] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Benchmark Quality Metrics Bar Chart (2 cols) */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Retrieval & Grounding Benchmark Scores (%)</CardTitle>
          <CardDescription>
            Side-by-side evaluation against 250 enterprise benchmark test cases (Higher is better)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#78716c"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <YAxis
                  stroke="#78716c"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e7e5e4',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Bar
                  dataKey="Naive"
                  name="Naive RAG (Baseline)"
                  fill="#a8a29e" // Stone-400
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="Advanced"
                  name="Advanced RAG (RAGLens)"
                  fill="#047857" // Emerald-700
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Latency Allocation Breakdown (1 col) */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Stage Latency</CardTitle>
          <CardDescription>
            P95 Execution time allocation per stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3.5 pt-1">
            {latencyBreakdown.map((stage, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-stone-700">{stage.step}</span>
                  <span className="font-mono text-stone-500 font-semibold">
                    {stage.ms}ms
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(8, (stage.ms / 250) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-stone-50 p-3 border border-stone-200 text-xs text-stone-600">
            <span className="font-semibold text-stone-900">Total P95 Latency: </span>
            <span className="font-mono text-emerald-800 font-bold">410ms</span>
            <p className="mt-0.5 text-[11px] text-stone-500">
              Parallelized multi-query execution reduced end-to-end latency by 29.3%.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
