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
  FileCode2,
  BrainCircuit,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './MultiModelRouterFlow.css';

interface PresetQuery {
  id: string;
  category: string;
  tabLabel: string;
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
    category: 'Math & Logic Proof',
    tabLabel: 'Math Proof',
    prompt: 'Solve integral of (x^3 + 2x) dx with step-by-step mathematical proof',
    targetModelId: 'deepseek-r1',
    reasoning: 'Routed to DeepSeek-R1 (Groq): Complex derivation & logic proof detected.',
    latency: '780ms',
    tokensPerSec: '142 t/s',
    confidence: '99.4%'
  },
  {
    id: 'rag',
    category: 'Sub-300ms Campus QA',
    tabLabel: 'Fast RAG',
    prompt: 'What is the minimum attendance criteria required for semester exams?',
    targetModelId: 'llama-3-3',
    reasoning: 'Routed to Llama 3.3 70B (Groq): Campus regulation query. Sub-300ms SLA active.',
    latency: '210ms',
    tokensPerSec: '380 t/s',
    confidence: '99.8%'
  },
  {
    id: 'ocr',
    category: 'Poster Vision OCR',
    tabLabel: 'Vision OCR',
    prompt: '[Multimodal Image] Extract event date, venue, & rules from poster.png',
    targetModelId: 'gemini-flash',
    reasoning: 'Routed to Gemini 2.0 Flash: Multimodal image & 1M vision context.',
    latency: '420ms',
    tokensPerSec: '210 t/s',
    confidence: '98.9%'
  },
  {
    id: 'vector',
    category: 'Hybrid Vector RRF',
    tabLabel: 'Vector Search',
    prompt: 'Search syllabus for CSE 3rd Year Data Mining lab curriculum topics',
    targetModelId: 'cohere-bge',
    reasoning: 'Routed to Cohere Command R+ & BGE-M3: Dense vector + BM25 RRF Search.',
    latency: '140ms',
    tokensPerSec: 'Vector Search',
    confidence: '99.9%'
  },
  {
    id: 'pdf',
    category: 'PDF Table Structuring',
    tabLabel: 'PDF Parse',
    prompt: 'Extract examination timetable grid from Regulation_2026.pdf',
    targetModelId: 'camelot-parser',
    reasoning: 'Routed to Camelot & PyMuPDF: Grid table structure parsing.',
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
  accentColor: string;
  glowShadow: string;
  bgSoft: string;
  icon: any;
}

const MODELS_MATRIX: ModelNode[] = [
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    provider: 'Groq Cloud',
    role: 'Complex Math & Algorithmic Logic Proofs',
    badge: 'Reasoning',
    accentColor: '#0284c7',
    glowShadow: 'rgba(2, 132, 199, 0.25)',
    bgSoft: '#e0f2fe',
    icon: BrainCircuit
  },
  {
    id: 'llama-3-3',
    name: 'Llama 3.3',
    provider: 'Groq LPU',
    role: 'Sub-300ms Campus QA & Regulations RAG',
    badge: 'Speed RAG',
    accentColor: '#7c3aed',
    glowShadow: 'rgba(124, 58, 237, 0.25)',
    bgSoft: '#f3e8ff',
    icon: Zap
  },
  {
    id: 'gemini-flash',
    name: 'Gemini Flash',
    provider: 'Google AI',
    role: 'Multimodal Vision OCR & Event Poster Analysis',
    badge: 'Vision OCR',
    accentColor: '#059669',
    glowShadow: 'rgba(5, 150, 105, 0.25)',
    bgSoft: '#dcfce7',
    icon: Eye
  },
  {
    id: 'cohere-bge',
    name: 'Cohere RRF',
    provider: 'pgvector API',
    role: 'Dense Vectors & BM25 Hybrid Rank Fusion',
    badge: 'RRF Search',
    accentColor: '#d97706',
    glowShadow: 'rgba(217, 119, 6, 0.25)',
    bgSoft: '#fef3c7',
    icon: Layers
  },
  {
    id: 'camelot-parser',
    name: 'Camelot PDF',
    provider: 'FastAPI Engine',
    role: 'PDF Timetable & Handout Grid Extraction',
    badge: 'PDF Table',
    accentColor: '#0891b2',
    glowShadow: 'rgba(8, 145, 178, 0.25)',
    bgSoft: '#cffaff',
    icon: FileCode2
  }
];

export default function MultiModelRouterFlow() {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-cycle presets every 3.8s when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActivePresetIndex((prev) => (prev + 1) % PRESET_QUERIES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentPreset = PRESET_QUERIES[activePresetIndex];

  // Calculate slide offset percentage for smooth carousel gliding
  // Maximum offset clamps at index 2 (showing models 2, 3, 4) on 3-card view
  const slideOffsetIndex = Math.min(activePresetIndex, MODELS_MATRIX.length - 3 < 0 ? 0 : MODELS_MATRIX.length - 3);

  const handlePrev = () => {
    setIsPlaying(false);
    setActivePresetIndex((prev) => (prev > 0 ? prev - 1 : PRESET_QUERIES.length - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setActivePresetIndex((prev) => (prev < PRESET_QUERIES.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="router-flow-wrapper">
      {/* Header Bar */}
      <div className="router-flow-header">
        <div className="router-header-title-group">
          <div className="router-header-icon">
            <Cpu size={22} />
          </div>
          <div>
            <h2 className="router-main-title">DIET Multi-Model LLM Routing Engine</h2>
            <div className="router-main-sub">
              <span className="live-indicator-tag">OPERATIONAL ROUTER</span>
              <span>Sub-300ms SLA & Multimodal Matrix</span>
            </div>
          </div>
        </div>

        {/* Query Switcher Pills */}
        <div className="header-actions-group">
          <div className="preset-tabs-bar">
            {PRESET_QUERIES.map((preset, index) => {
              const isActive = index === activePresetIndex;
              return (
                <button
                  key={preset.id}
                  className={`tab-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActivePresetIndex(index);
                    setIsPlaying(false);
                  }}
                >
                  <Sparkles size={12} style={{ color: isActive ? '#0284c7' : '#94a3b8' }} />
                  <span>{preset.tabLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            className="flow-play-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Auto Demo' : 'Start Auto Demo'}
          >
            {isPlaying ? <Pause size={12} style={{ color: '#0284c7' }} /> : <Play size={12} style={{ color: '#059669' }} />}
            <span>{isPlaying ? 'Auto Flow' : 'Play Flow'}</span>
          </button>
        </div>
      </div>

      {/* Top Active Execution Box */}
      <div className="active-execution-box">
        <div className="execution-left">
          <div className="execution-payload-title">
            Incoming User Query Payload &bull; {currentPreset.category}
          </div>
          <div className="execution-prompt-text">
            "{currentPreset.prompt}"
          </div>
          <div className="execution-reasoning-tag">
            <CheckCircle2 size={13} />
            <span>{currentPreset.reasoning}</span>
          </div>
        </div>

        <div className="execution-metrics-right">
          <div className="kpi-cell">
            <span className="kpi-label">Latency</span>
            <span className="kpi-value" style={{ color: '#0284c7' }}>{currentPreset.latency}</span>
          </div>
          <div className="kpi-cell" style={{ borderLeft: '1px solid rgba(0,0,0,0.08)', paddingLeft: '1rem' }}>
            <span className="kpi-label">Throughput</span>
            <span className="kpi-value" style={{ color: '#7c3aed' }}>{currentPreset.tokensPerSec}</span>
          </div>
          <div className="kpi-cell" style={{ borderLeft: '1px solid rgba(0,0,0,0.08)', paddingLeft: '1rem' }}>
            <span className="kpi-label">Accuracy</span>
            <span className="kpi-value" style={{ color: '#059669' }}>{currentPreset.confidence}</span>
          </div>
        </div>
      </div>

      {/* CAROUSEL / SLIDE VIEW */}
      <div className="carousel-view-header">
        <div className="carousel-title-label">
          <Sparkles size={14} style={{ color: '#0284c7' }} />
          <span>Active Architecture Matrix (Interactive Slide View)</span>
        </div>
        <div className="carousel-controls">
          <button className="carousel-arrow-btn" onClick={handlePrev} title="Previous Model">
            <ChevronLeft size={16} />
          </button>
          <button className="carousel-arrow-btn" onClick={handleNext} title="Next Model">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Carousel Track Container */}
      <div className="carousel-track-container">
        <div 
          className="carousel-track"
          style={{
            transform: `translateX(-${slideOffsetIndex * 33.333}%)`
          }}
        >
          {MODELS_MATRIX.map((model) => {
            const isSelected = model.id === currentPreset.targetModelId;
            const IconComp = model.icon;

            return (
              <div
                key={model.id}
                className={`carousel-slide-item ${isSelected ? 'active-target' : ''}`}
                style={{
                  '--accent-color': model.accentColor,
                  '--glow-shadow': model.glowShadow,
                  '--bg-soft': model.bgSoft,
                } as React.CSSProperties}
                onClick={() => {
                  const targetIdx = PRESET_QUERIES.findIndex(p => p.targetModelId === model.id);
                  if (targetIdx !== -1) {
                    setActivePresetIndex(targetIdx);
                    setIsPlaying(false);
                  }
                }}
              >
                {isSelected && <div className="card-pulse-outline" />}

                <div>
                  <div className="card-top-row">
                    <div className="card-title-group">
                      <div className="card-icon-box">
                        <IconComp size={16} />
                      </div>
                      <span className="card-model-name">{model.name}</span>
                    </div>
                    <span className="card-badge">{model.badge}</span>
                  </div>

                  <div className="card-role-text">{model.role}</div>
                </div>

                <div className="card-bottom-row">
                  <span>{model.provider}</span>
                  <div className="latency-status-tag">
                    {isSelected ? (
                      <>
                        <ArrowUpRight size={12} />
                        <span>{currentPreset.latency}</span>
                      </>
                    ) : (
                      <span>Standby</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide Navigation Dots Bar */}
      <div className="carousel-dots-bar">
        {PRESET_QUERIES.map((_, idx) => (
          <button
            key={idx}
            className={`dot-btn ${idx === activePresetIndex ? 'active' : ''}`}
            onClick={() => {
              setActivePresetIndex(idx);
              setIsPlaying(false);
            }}
            title={`Slide to Model ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
