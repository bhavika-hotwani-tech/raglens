/**
 * Realistic enterprise mock data for RAGLens platform.
 * Contains authentic legal, clinical, HR, and compliance document records,
 * multi-step pipeline traces, benchmark metrics, and conversation histories.
 */

export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-101',
    name: 'Master_Services_Agreement_Acme_Enterprise_2025.pdf',
    type: 'pdf',
    size: 4404019, // 4.2 MB
    status: 'Indexed',
    chunksCount: 184,
    embeddingModel: 'text-embedding-3-large (3072d)',
    uploadedAt: '2025-05-12T10:14:00Z',
    category: 'Legal / Contracts',
    summary: 'Master enterprise software license agreement covering terms of service, SLA guarantees, data liability caps, and indemnification exclusions.',
  },
  {
    id: 'doc-102',
    name: 'SOC2_Type_II_Security_Compliance_Report_2024.pdf',
    type: 'pdf',
    size: 3250585, // 3.1 MB
    status: 'Indexed',
    chunksCount: 142,
    embeddingModel: 'text-embedding-3-large (3072d)',
    uploadedAt: '2025-05-14T08:30:00Z',
    category: 'Security & Compliance',
    summary: 'Independent audit report evaluating Trust Services Criteria: Security, Confidentiality, and Processing Integrity of cloud infrastructure.',
  },
  {
    id: 'doc-103',
    name: 'Clinical_Trial_Protocol_Phase3_Oncology_v2.pdf',
    type: 'pdf',
    size: 8912896, // 8.5 MB
    status: 'Indexed',
    chunksCount: 412,
    embeddingModel: 'text-embedding-3-large (3072d)',
    uploadedAt: '2025-05-18T14:22:00Z',
    category: 'Clinical / Regulatory',
    summary: 'Double-blind, randomized multi-center trial protocol examining progression-free survival (PFS) endpoints and biomarker stratification.',
  },
  {
    id: 'doc-104',
    name: 'Global_Employee_Handbook_and_Conduct_Policy_v4.docx',
    type: 'docx',
    size: 1887436, // 1.8 MB
    status: 'Indexed',
    chunksCount: 96,
    embeddingModel: 'text-embedding-3-large (3072d)',
    uploadedAt: '2025-05-20T11:05:00Z',
    category: 'Human Resources',
    summary: 'Internal guidelines for remote work stipends, confidential whistleblower procedures, leave policies, and code of business ethics.',
  },
  {
    id: 'doc-105',
    name: 'Annual_10K_SEC_Financial_Filing_FY24.pdf',
    type: 'pdf',
    size: 13002342, // 12.4 MB
    status: 'Indexed',
    chunksCount: 620,
    embeddingModel: 'text-embedding-3-large (3072d)',
    uploadedAt: '2025-05-22T09:40:00Z',
    category: 'Finance & Investor Relations',
    summary: 'Comprehensive financial disclosures, risk factors regarding AI infrastructure capital expenditures, and segment earnings breakdown.',
  },
  {
    id: 'doc-106',
    name: 'HIPAA_Privacy_Rule_Technical_Safeguards.txt',
    type: 'txt',
    size: 860160, // 840 KB
    status: 'Indexed',
    chunksCount: 58,
    embeddingModel: 'text-embedding-3-large (3072d)',
    uploadedAt: '2025-05-25T16:15:00Z',
    category: 'Healthcare & Legal',
    summary: 'Technical implementation specifications for protected health information (ePHI) encryption at rest and in transit, plus audit log access controls.',
  },
  {
    id: 'doc-107',
    name: 'Cloud_Infrastructure_Disaster_Recovery_Plan.pdf',
    type: 'pdf',
    size: 2411724, // 2.3 MB
    status: 'Processing',
    chunksCount: 0,
    embeddingModel: 'text-embedding-3-large (3072d)',
    uploadedAt: '2025-05-28T18:02:00Z',
    category: 'DevOps / Engineering',
    summary: 'Multi-region failover runbooks, RTO (under 15 min), and RPO (under 1 min) specifications across AWS and GCP nodes.',
  },
  {
    id: 'doc-108',
    name: 'Legacy_Vendor_Procurement_Contract_Expired.pdf',
    type: 'pdf',
    size: 972800, // 950 KB
    status: 'Failed',
    chunksCount: 0,
    embeddingModel: 'text-embedding-3-large (3072d)',
    uploadedAt: '2025-05-27T12:10:00Z',
    category: 'Procurement',
    summary: 'Corrupted OCR layer encountered during document parsing. Re-upload with clear high-resolution scan is advised.',
  },
];

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-1',
    title: 'Acme MSA Indemnification & Liability Caps',
    updatedAt: '2025-05-28T14:45:00Z',
    messagesCount: 4,
    preview: 'What are the mutual indemnification limits and carve-outs in the Acme MSA?',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'What are the mutual indemnification limits and carve-outs in the Acme MSA?',
        timestamp: '2025-05-28T14:43:10Z',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `Based on Section 11.2 (*Limitation of Liability*) and Section 11.4 (*Mutual Indemnification*) of the **Master Services Agreement with Acme Enterprise (2025)**:

1. **General Liability Cap:** 
   The aggregate cumulative liability of either party for claims arising under the Agreement is expressly capped at **two times (2x) the total fees paid or payable** by the Customer during the preceding twelve (12) month period.

2. **Express Carve-Outs (Uncapped Liability):**
   The liability cap does **not** apply to the following specified breaches:
   * **Gross negligence or willful misconduct** by either party or its authorized subcontractors.
   * **Breach of confidentiality obligations** under Section 8 (*Proprietary & Non-Disclosure Information*).
   * **Third-Party Intellectual Property Indemnity** claims under Section 11.1 (where Acme defends customer against patent or copyright infringement).
   * **Data Security & Privacy indemnification** involving willful violation of applicable data protection legislation (GDPR / CCPA).

3. **Notice & Defense Window:**
   The indemnified party must provide written notice within **thirty (30) calendar days** of receiving notice of any third-party claim to preserve full indemnification rights.`,
        timestamp: '2025-05-28T14:43:12Z',
        sources: [
          {
            id: 'src-1',
            docId: 'doc-101',
            docName: 'Master_Services_Agreement_Acme_Enterprise_2025.pdf',
            page: 24,
            chunkId: 'chk-101-088',
            score: 0.96,
            text: 'Section 11.2 Aggregate Liability. Except for liabilities arising under Section 11.1 (IP Indemnity) and Section 8 (Confidentiality), neither party\'s aggregate liability shall exceed two times (2x) the amounts paid by Customer in the twelve (12) months preceding the claim event.',
          },
          {
            id: 'src-2',
            docId: 'doc-101',
            docName: 'Master_Services_Agreement_Acme_Enterprise_2025.pdf',
            page: 26,
            chunkId: 'chk-101-094',
            score: 0.91,
            text: 'Section 11.4 Exceptions to Limitations. The limitations and exclusions in Section 11.2 shall not apply to: (i) either party\'s gross negligence or intentional misconduct; (ii) indemnification obligations under Section 11.1; or (iii) damages resulting from breach of Section 8 (Confidentiality).',
          },
          {
            id: 'src-3',
            docId: 'doc-102',
            docName: 'SOC2_Type_II_Security_Compliance_Report_2024.pdf',
            page: 18,
            chunkId: 'chk-102-042',
            score: 0.78,
            text: 'Control Ref CC6.7: Transmission of confidential customer contract terms and customer authentication credentials requires TLS 1.3 encryption. Security policies align with enterprise master service agreement liabilities.',
          },
        ],
        pipelineTrace: [
          {
            step: 'Query Rewrite',
            status: 'Passed',
            latencyMs: 18,
            details: 'Normalized query: Expanded acronym "MSA" -> "Master Services Agreement", added synonym expansion: "liability cap", "indemnification ceiling", "exclusion carve-outs".',
          },
          {
            step: 'Multi-Query Expansion',
            status: 'Passed',
            latencyMs: 34,
            details: 'Generated 3 sub-queries for parallel vector & lexical retrieval: (1) Acme Master Services Agreement Section 11 liability cap, (2) Mutual indemnification carveouts and exclusions, (3) Confidentiality and gross negligence exceptions.',
          },
          {
            step: 'Hybrid Retrieval (Dense + BM25)',
            status: 'Passed',
            latencyMs: 64,
            details: 'Retrieved 20 dense vector candidates (text-embedding-3-large) + 20 BM25 lexical candidates. Fused via Reciprocal Rank Fusion (RRF, k=60).',
          },
          {
            step: 'Cross-Encoder Rerank',
            status: 'Passed',
            latencyMs: 42,
            details: 'Model: BAAI/bge-reranker-large. Re-scored top 40 candidates. Selected top 3 chunks (min score threshold >= 0.75). Filtered out 37 irrelevant chunks.',
          },
          {
            step: 'Context Generation',
            status: 'Passed',
            latencyMs: 215,
            details: 'Prompt assembled with 1,280 tokens of grounded context. Generated response with precise markdown citations and legal cross-references.',
          },
          {
            step: 'Self-Correction & Faithfulness Check',
            status: 'Passed',
            latencyMs: 31,
            details: 'Evaluator verified all 4 legal clauses against source text chunks. Hallucination score: 0.00 (Zero ungrounded claims detected).',
          },
        ],
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'HIPAA Breach Notification Protocol & Timeline',
    updatedAt: '2025-05-27T16:10:00Z',
    messagesCount: 2,
    preview: 'What is the mandatory notification timeline when a potential ePHI breach is detected?',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'What is the mandatory notification timeline when a potential ePHI breach is detected under our technical safeguards policy?',
        timestamp: '2025-05-27T16:08:00Z',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `Under the **HIPAA Privacy Rule Technical Safeguards & Incident Management Policy**:

1. **Immediate Internal Escalation (< 1 Hour):**
   Any security incident involving suspected unauthorized access to electronic Protected Health Information (ePHI) must be escalated to the Chief Information Security Officer (CISO) and Compliance Officer within **one (1) hour** of detection.

2. **Forensic Assessment Window (< 24 Hours):**
   The security incident response team must isolate affected subnets, execute memory dumps, and determine whether a "low probability of compromise" can be demonstrated based on a 4-factor risk assessment.

3. **External Regulatory Notification Requirements:**
   * **Individual Patient Notice:** Written notification without unreasonable delay and in no case later than **sixty (60) calendar days** after discovery.
   * **HHS Office for Civil Rights (OCR) Notice:**
     * For breaches affecting **500 or more individuals**: Notification must be submitted concurrently with individual notice (within **60 days**).
     * For breaches affecting **fewer than 500 individuals**: Recorded in the annual breach log and submitted to HHS within **60 days after the end of the calendar year**.
   * **Prominent Media Outlets:** Required within **60 days** if more than 500 residents of a single state or jurisdiction are impacted.`,
        timestamp: '2025-05-27T16:08:03Z',
        sources: [
          {
            id: 'src-4',
            docId: 'doc-106',
            docName: 'HIPAA_Privacy_Rule_Technical_Safeguards.txt',
            page: 1,
            chunkId: 'chk-106-012',
            score: 0.95,
            text: 'Section 4.1 Breach Notification Timelines: Covered entities and business associates must notify affected individuals within 60 calendar days following discovery. Breaches affecting 500+ individuals require HHS notification within 60 days.',
          },
          {
            id: 'src-5',
            docId: 'doc-102',
            docName: 'SOC2_Type_II_Security_Compliance_Report_2024.pdf',
            page: 42,
            chunkId: 'chk-102-108',
            score: 0.83,
            text: 'Incident Response Policy requires automated SIEM alerting on unauthorized database exfiltration attempts with P1 tier triage SLA within 60 minutes.',
          },
        ],
        pipelineTrace: [
          {
            step: 'Query Rewrite',
            status: 'Passed',
            latencyMs: 14,
            details: 'Disambiguated acronym ePHI to "electronic Protected Health Information", added statutory reference "45 CFR 164.400-414".',
          },
          {
            step: 'Multi-Query Expansion',
            status: 'Passed',
            latencyMs: 28,
            details: 'Sub-queries: (1) HIPAA breach notification 60 day deadline, (2) internal incident escalation timeline ePHI, (3) HHS OCR notification thresholds 500 records.',
          },
          {
            step: 'Hybrid Retrieval (Dense + BM25)',
            status: 'Passed',
            latencyMs: 52,
            details: '20 dense vectors + 20 sparse keyword matches merged with RRF. Top 5 selected.',
          },
          {
            step: 'Cross-Encoder Rerank',
            status: 'Passed',
            latencyMs: 38,
            details: 'Top 2 chunks passed relevance threshold of 0.80.',
          },
          {
            step: 'Context Generation',
            status: 'Passed',
            latencyMs: 198,
            details: 'Structured synthesized output detailing internal vs HHS vs media deadlines.',
          },
          {
            step: 'Self-Correction & Faithfulness Check',
            status: 'Passed',
            latencyMs: 25,
            details: 'Verified factual precision. 60-day deadlines corroborated across both citations.',
          },
        ],
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Phase 3 Clinical Trial Endpoint Analysis',
    updatedAt: '2025-05-25T11:20:00Z',
    messagesCount: 2,
    preview: 'What is the primary endpoint for progression-free survival in the Oncology trial?',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: 'What is the primary endpoint definition for progression-free survival (PFS) in the Phase 3 Oncology trial protocol?',
        timestamp: '2025-05-25T11:18:00Z',
      },
      {
        id: 'msg-6',
        role: 'assistant',
        content: `According to Section 6.1 (*Primary and Secondary Efficacy Endpoints*) of the **Phase 3 Oncology Protocol**:

The primary endpoint is **Progression-Free Survival (PFS)**, defined as the time from the date of randomization to the first documented occurrence of:
1. **Objective disease progression** evaluated by a Blinded Independent Central Review (BICR) in accordance with **RECIST version 1.1** criteria.
2. **Death from any cause**, whichever occurs first.

**Key Censoring Rules:**
* Patients who initiate non-protocol anti-cancer therapy prior to documented progression will be censored at the date of the last evaluable radiological tumor assessment prior to therapy initiation.
* The statistical power calculation targets a hazard ratio (HR) of **0.65** with 90% power at a two-sided alpha level of **0.05**.`,
        timestamp: '2025-05-25T11:18:03Z',
        sources: [
          {
            id: 'src-6',
            docId: 'doc-103',
            docName: 'Clinical_Trial_Protocol_Phase3_Oncology_v2.pdf',
            page: 58,
            chunkId: 'chk-103-122',
            score: 0.98,
            text: 'Section 6.1.1 Primary Endpoint: Progression-Free Survival (PFS) is defined as the time from randomization until first objective radiological progression per RECIST v1.1 determined by BICR, or death from any cause.',
          },
        ],
        pipelineTrace: [
          {
            step: 'Query Rewrite',
            status: 'Passed',
            latencyMs: 15,
            details: 'Resolved clinical abbreviations: PFS -> Progression-Free Survival, RECIST v1.1, BICR.',
          },
          {
            step: 'Multi-Query Expansion',
            status: 'Passed',
            latencyMs: 31,
            details: 'Sub-queries generated for endpoint criteria and radiological evaluation guidelines.',
          },
          {
            step: 'Hybrid Retrieval (Dense + BM25)',
            status: 'Passed',
            latencyMs: 60,
            details: 'Dense vector search with domain embedding filter for clinical protocols.',
          },
          {
            step: 'Cross-Encoder Rerank',
            status: 'Passed',
            latencyMs: 40,
            details: 'Chunk 103-122 achieved 0.98 cross-encoder relevance.',
          },
          {
            step: 'Context Generation',
            status: 'Passed',
            latencyMs: 205,
            details: 'Grounded medical summary with RECIST 1.1 citations.',
          },
          {
            step: 'Self-Correction & Faithfulness Check',
            status: 'Passed',
            latencyMs: 29,
            details: '100% faithfulness match against protocol document text.',
          },
        ],
      },
    ],
  },
];

export const EVALUATION_METRICS = {
  summary: {
    totalTestCases: 250,
    evaluatedDate: '2025-05-28T12:00:00Z',
    datasetName: 'Enterprise-Legal-Medical-Benchmark-v2.4',
    evaluatorModel: 'gpt-4o-evaluator (RAGAS & TruLens criteria)',
  },
  comparison: [
    {
      metric: 'Faithfulness',
      description: 'Measures factual grounding: percent of claims in answer directly supported by context.',
      naive: 0.714, // 71.4%
      advanced: 0.962, // 96.2%
      delta: 0.248, // +24.8%
      direction: 'higher',
      unit: '%',
    },
    {
      metric: 'Answer Relevancy',
      description: 'Measures how directly the answer addresses user query without unnecessary fluff.',
      naive: 0.682, // 68.2%
      advanced: 0.948, // 94.8%
      delta: 0.266, // +26.6%
      direction: 'higher',
      unit: '%',
    },
    {
      metric: 'Context Precision',
      description: 'Signal-to-noise ratio: fraction of relevant chunks ranked in top positions.',
      naive: 0.598, // 59.8%
      advanced: 0.915, // 91.5%
      delta: 0.317, // +31.7%
      direction: 'higher',
      unit: '%',
    },
    {
      metric: 'Context Recall',
      description: 'Measures completeness: percent of ground-truth evidence successfully retrieved.',
      naive: 0.641, // 64.1%
      advanced: 0.894, // 89.4%
      delta: 0.253, // +25.3%
      direction: 'higher',
      unit: '%',
    },
    {
      metric: 'End-to-End Latency',
      description: 'P95 latency from user query receipt to final verified token generation.',
      naive: 580, // 580ms
      advanced: 410, // 410ms
      delta: -170, // -170ms (faster)
      direction: 'lower',
      unit: 'ms',
    },
    {
      metric: 'Hallucination Rate',
      description: 'Frequency of unsupported speculative statements detected by critic models.',
      naive: 0.184, // 18.4%
      advanced: 0.014, // 1.4%
      delta: -0.170, // -17.0% (better)
      direction: 'lower',
      unit: '%',
    },
  ],
  chartData: [
    { name: 'Faithfulness', Naive: 71.4, Advanced: 96.2 },
    { name: 'Relevancy', Naive: 68.2, Advanced: 94.8 },
    { name: 'Precision', Naive: 59.8, Advanced: 91.5 },
    { name: 'Recall', Naive: 64.1, Advanced: 89.4 },
    { name: 'Grounding', Naive: 74.5, Advanced: 97.1 },
  ],
  latencyBreakdown: [
    { step: 'Query Rewrite', ms: 18 },
    { step: 'Multi-Query', ms: 34 },
    { step: 'Hybrid Retrieval', ms: 64 },
    { step: 'Reranker', ms: 42 },
    { step: 'LLM Generation', ms: 215 },
    { step: 'Self-Check Audit', ms: 37 },
  ],
};

export const DASHBOARD_STATS = {
  totalDocuments: 8,
  totalChunks: 14820,
  queriesToday: 1429,
  avgFaithfulness: 0.964, // 96.4%
  statsDeltas: {
    documents: '+2 added this week',
    chunks: '+1,240 new vectors',
    queries: '+18.4% vs yesterday',
    faithfulness: '+4.2% vs baseline',
  },
  queriesChart: [
    { date: 'Mon', queries: 820, avgLatency: 420 },
    { date: 'Tue', queries: 1140, avgLatency: 410 },
    { date: 'Wed', queries: 990, avgLatency: 395 },
    { date: 'Thu', queries: 1340, avgLatency: 405 },
    { date: 'Fri', queries: 1580, avgLatency: 388 },
    { date: 'Sat', queries: 620, avgLatency: 375 },
    { date: 'Sun', queries: 1429, avgLatency: 410 },
  ],
  systemHealth: {
    vectorStore: { status: 'Healthy', provider: 'Qdrant Distributed Clustered', latency: '14ms' },
    reranker: { status: 'Operational', model: 'BAAI/bge-reranker-large', p99: '44ms' },
    embeddingCache: { hitRate: '94.8%', memoryUsage: '1.2 GB / 8 GB' },
    guardrails: { status: 'Active', hallucinationFilter: 'Strict' },
  },
  recentActivity: [
    {
      id: 'act-1',
      action: 'Document Uploaded',
      target: 'Cloud_Infrastructure_Disaster_Recovery_Plan.pdf',
      user: 'Sarah Chen (Lead AI Engineer)',
      time: '12 minutes ago',
      status: 'Processing',
    },
    {
      id: 'act-2',
      action: 'Evaluation Benchmark Ran',
      target: '250 Test Cases evaluated on RAGAS criteria (96.2% score)',
      user: 'Automated Pipeline (CI/CD)',
      time: '2 hours ago',
      status: 'Success',
    },
    {
      id: 'act-3',
      action: 'Indexed Document',
      target: 'HIPAA_Privacy_Rule_Technical_Safeguards.txt (58 chunks)',
      user: 'Marcus Vance (Compliance Officer)',
      time: '5 hours ago',
      status: 'Success',
    },
    {
      id: 'act-4',
      action: 'Configuration Modified',
      target: 'Cross-Encoder rerank threshold increased to 0.75',
      user: 'Sarah Chen (Lead AI Engineer)',
      time: '1 day ago',
      status: 'Success',
    },
    {
      id: 'act-5',
      action: 'Failed Ingestion Flagged',
      target: 'Legacy_Vendor_Procurement_Contract_Expired.pdf (OCR Error)',
      user: 'System Ingestion Worker #3',
      time: '1 day ago',
      status: 'Error',
    },
  ],
};
