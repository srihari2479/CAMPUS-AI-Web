import { useState, useEffect } from 'react';
import { 
  Cpu, 
  Zap, 
  Eye, 
  Layers, 
  Play, 
  Pause, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  ShieldCheck,
  FileCode2,
  BrainCircuit
} from 'lucide-react';
import './MultiModelRouterFlow.css';

interface PresetQuery {
  id: string;
  category: string;
  iconName: string;
  prompt: string;
  targetModelId: string;
  reasoning: string;
  latency: string;
  tokensPerSec: string;
  confidence: string;
}

const PRESET_QUERIES: PresetQuery[] = [
  {
    id: 'math',
    category: 'Math & Logic',
    iconName: 'Binary',
    prompt: 'Solve integral of (x^3 + 2x) dx with step-by-step proof',
    targetModelId: 'deepseek-r1',
    reasoning: 'Routed to DeepSeek-R1 (Groq): Complex mathematical proof & logical reasoning detected.',
    latency: '780ms',
    tokensPerSec: '142 t/s',
    confidence: '99.4%'
  },
  {
    id: 'rag',
    category: 'Sub-300ms RAG',
    iconName: 'Zap',
    prompt: 'What is the minimum attendance requirement for semester exams?',
    targetModelId: 'llama-3-3',
    reasoning: 'Routed to Llama 3.3 70B (Groq): Standard campus regulations query. Sub-300ms SLA active.',
    latency: '210ms',
    tokensPerSec: '380 t/s',
    confidence: '99.8%'
  },
  {
    id: 'ocr',
    category: 'Poster Vision OCR',
    iconName: 'Eye',
    prompt: '[Multimodal Image] Extract hackathon event date, venue, & rules',
    targetModelId: 'gemini-flash',
    reasoning: 'Routed to Gemini 2.0 Flash: Multimodal image payload & 1M context requirement.',
    latency: '420ms',
    tokensPerSec: '210 t/s',
    confidence: '98.9%'
  },
  {
    id: 'vector',
    category: 'Hybrid Vector RRF',
    iconName: 'Layers',
    prompt: 'Search syllabus for CSE 3rd Year Data Mining lab topics',
    targetModelId: 'cohere-bge',
    reasoning: 'Routed to Cohere Command R+ & BGE-M3: Dense vector embedding + BM25 reciprocal rank fusion.',
    latency: '140ms',
    tokensPerSec: 'N/A (Rerank)',
    confidence: '99.9%'
  },
  {
    id: 'pdf',
    category: 'PDF Table Structuring',
    iconName: 'FileCode2',
    prompt: 'Extract exam timetable matrix from Regulation_2026.pdf',
    targetModelId: 'camelot-parser',
    reasoning: 'Routed to Camelot & PyMuPDF Pipeline: Grid-based table structure detected in PDF handout.',
    latency: '95ms',
    tokensPerSec: 'Direct Parse',
    confidence: '100%'
  }
];

interface ModelNode {
  id: string;
  name: string;
  provider: string;
  role: string;
  badge: string;
  specs: string;
  nodeColor: string;
  glowColor: string;
  icon: any;
}

const MODELS_MATRIX: ModelNode[] = [
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    provider: 'Groq Cloud / OpenRouter',
    role: 'Complex Math, Multi-Step Proofs & Algorithmic Logic',
    badge: 'Reasoning SOTA',
    specs: '64k Context • ~780ms • 100% Proof Acc',
    nodeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    icon: BrainCircuit
  },
  {
    id: 'llama-3-3',
    name: 'Llama 3.3 70B',
    provider: 'Groq LPU Engine',
    role: 'Sub-300ms Campus QA, Regulations & Instant RAG',
    badge: 'Speed King',
    specs: '128k Context • ~210ms • 380 Tokens/sec',
    nodeColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    icon: Zap
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google AI Studio',
    role: 'Multimodal Vision OCR & Event Poster Extraction',
    badge: '1M Vision OCR',
    specs: '1,000,000 Context • ~420ms • Image Analysis',
    nodeColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    icon: Eye
  },
  {
    id: 'cohere-bge',
    name: 'Cohere & BGE-M3',
    provider: 'pgvector / Supabase',
    role: 'Dense Embeddings & BM25 Reciprocal Rank Fusion (RRF)',
    badge: 'RRF Re-Ranker',
    specs: '1024-dim • ~140ms • Cosine Similarity',
    nodeColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    icon: Layers
  },
  {
    id: 'camelot-parser',
    name: 'Camelot & PyMuPDF',
    provider: 'FastAPI Microservice',
    role: 'PDF Handout & Academic Timetable Grid Extraction',
    badge: 'Table Parsing',
    specs: 'Grid Boundary • ~95ms • Structured JSON',
    nodeColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    icon: FileCode2
  }
];

export default function MultiModelRouterFlow() {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-cycle presets when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActivePresetIndex((prev) => (prev + 1) % PRESET_QUERIES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentPreset = PRESET_QUERIES[activePresetIndex];

  return (
    <div className="router-flow-container">
      {/* Header */}
      <div className="router-flow-header">
        <div className="router-flow-title-group">
          <div className="router-title-icon">
            <Cpu size={24} />
          </div>
          <div>
            <h2 className="router-flow-title">DIET Multi-Model LLM Routing Engine</h2>
            <div className="router-flow-subtitle">
              <span className="badge badge-success" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                LIVE ARCHITECTURE
              </span>
              <span>SOTA Dynamic Intent Classifier & Real-Time Model Routing</span>
            </div>
          </div>
        </div>

        {/* Preset selector bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="router-preset-bar">
            {PRESET_QUERIES.map((preset, index) => {
              const isActive = index === activePresetIndex;
              return (
                <button
                  key={preset.id}
                  className={`preset-pill ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActivePresetIndex(index);
                    setIsPlaying(false); // pause auto-cycle on manual click
                  }}
                >
                  <Sparkles size={12} style={{ color: isActive ? '#38bdf8' : 'inherit' }} />
                  <span>{preset.category}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              padding: '0.45rem 0.85rem',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            title={isPlaying ? 'Pause auto animation' : 'Start auto animation'}
          >
            {isPlaying ? <Pause size={13} style={{ color: '#38bdf8' }} /> : <Play size={13} style={{ color: '#10b981' }} />}
            <span>{isPlaying ? 'Auto Flow' : 'Play Flow'}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Stage Visual Pipeline Layout */}
      <div className="pipeline-layout">
        {/* Stage 1: Prompt Input Node */}
        <div className="pipeline-stage-box" style={{ borderLeft: '4px solid #38bdf8' }}>
          <div>
            <div className="stage-badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <span>Stage 1: User Query</span>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              padding: '0.85rem',
              fontSize: '0.82rem',
              lineHeight: 1.4,
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Incoming Request Payload
              </div>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>"{currentPreset.prompt}"</div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              <span>Classification:</span>
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>{currentPreset.category}</span>
            </div>
          </div>
        </div>

        {/* Stage 2: Multi-Model LLM Matrix Grid (All 5 SOTA Models Visualized) */}
        <div className="pipeline-stage-box" style={{ borderTop: '3px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div className="stage-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#a855f7', margin: 0 }}>
              <span>Stage 2: SOTA LLM Router & Matrix (5 Active Models)</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={12} className="animate-spin" />
              <span>Smart Routing Active</span>
            </div>
          </div>

          <div className="models-matrix-grid">
            {MODELS_MATRIX.map((model) => {
              const isSelected = model.id === currentPreset.targetModelId;
              const IconComp = model.icon;

              return (
                <div
                  key={model.id}
                  className={`model-card-node ${isSelected ? 'active-routed' : ''}`}
                  style={{
                    '--node-color': model.nodeColor,
                    '--glow-color': model.glowColor,
                  } as React.CSSProperties}
                >
                  {isSelected && <div className="active-beam-indicator" />}

                  <div className="model-header">
                    <div className="model-name">
                      <IconComp size={16} style={{ color: model.nodeColor }} />
                      <span>{model.name}</span>
                    </div>
                    <span className="model-provider">{model.badge}</span>
                  </div>

                  <div className="model-role">{model.role}</div>

                  <div className="model-metrics-row">
                    <span>{model.provider}</span>
                    <div className="latency-pill">
                      {isSelected ? (
                        <>
                          <CheckCircle2 size={11} style={{ color: model.nodeColor }} />
                          <span>{currentPreset.latency}</span>
                        </>
                      ) : (
                        <span>Ready</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage 3: Synthesized Output & Routing Decision */}
        <div className="pipeline-stage-box" style={{ borderRight: '4px solid #10b981' }}>
          <div>
            <div className="stage-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <span>Stage 3: Verified Output</span>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              padding: '0.85rem',
              fontSize: '0.8rem',
              lineHeight: 1.45,
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={13} />
                <span>Router Decision Logic</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#f8fafc' }}>
                {currentPreset.reasoning}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Execution Latency:</span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>{currentPreset.latency}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Throughput Speed:</span>
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>{currentPreset.tokensPerSec}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Confidence Score:</span>
              <span style={{ fontWeight: 700, color: '#a855f7' }}>{currentPreset.confidence}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live System Metrics Footer */}
      <div className="router-stats-footer">
        <div className="stat-item">
          <div className="stat-icon-mini" style={{ color: '#38bdf8' }}>
            <Cpu size={18} />
          </div>
          <div>
            <div className="stat-text-label">Active SOTA Models</div>
            <div className="stat-text-val">5 Integrated Engines</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon-mini" style={{ color: '#10b981' }}>
            <Zap size={18} />
          </div>
          <div>
            <div className="stat-text-label">Router Decision Speed</div>
            <div className="stat-text-val">&lt; 12ms Classification</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon-mini" style={{ color: '#a855f7' }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="stat-text-label">System Fallback Policy</div>
            <div className="stat-text-val">Automatic Failover</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon-mini" style={{ color: '#f59e0b' }}>
            <Activity size={18} />
          </div>
          <div>
            <div className="stat-text-label">Global SLA SLA Compliance</div>
            <div className="stat-text-val">99.98% Operational</div>
          </div>
        </div>
      </div>
    </div>
  );
}
