import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ResultMetrics } from './components/ResultMetrics';
import { processContent } from './services/geminiService';
import { OptimizationMode, AnalysisResult } from './types';
import { 
  Wand2, 
  Copy, 
  RotateCcw, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Menu,
  Loader2,
  FileText,
  Sparkles,
  Info,
  ImageIcon,
  Download
} from 'lucide-react';

const SAMPLE_TEXTS = {
  [OptimizationMode.DETECT]: "随着人工智能技术的飞速发展，我们需要深入探讨生成式模型带来的多重影响。这项技术强调了范式的转变，不仅在技术层面，更在社会伦理层面引发了广泛的讨论...",
  [OptimizationMode.HUMANIZE]: "此外，该策略的实施利用了一个全面的框架。因此，必须考虑情况的各个方面，以确保实现最佳结果。这种方法旨在促进协同增效，解决所有潜在的差异。",
  [OptimizationMode.TOUTIAO]: "西瓜对健康有益。它们含有维生素和水分。你应该在夏天吃它们。",
  [OptimizationMode.WECHAT]: "我们公司今天发布了一款新产品。它非常好。它有很多功能。请购买它。",
  [OptimizationMode.SEO]: "2024年最好的咖啡机。咖啡是一种由烘焙咖啡豆制成的冲泡饮料。在这里购买咖啡机。",
  [OptimizationMode.ACADEMIC]: "我认为这个实验挺酷的，结果也很大。我们看到很多东西发生了变化，这表明我们的想法可能是对的。"
};

function App() {
  const [mode, setMode] = useState<OptimizationMode>(OptimizationMode.DETECT);
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXTS[OptimizationMode.DETECT]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset result when mode changes, optionally set sample text
    setResult(null);
    setError(null);
    // Only set sample text if input is empty or matches another sample
    const isSample = Object.values(SAMPLE_TEXTS).includes(inputText);
    if (inputText === '' || isSample) {
      setInputText(SAMPLE_TEXTS[mode]);
    }
  }, [mode]);

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await processContent(inputText, mode);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "发生错误");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const getModeColor = () => {
    switch (mode) {
      case OptimizationMode.DETECT: return 'bg-red-500';
      case OptimizationMode.HUMANIZE: return 'bg-purple-500';
      case OptimizationMode.TOUTIAO: return 'bg-orange-500';
      case OptimizationMode.WECHAT: return 'bg-green-500';
      case OptimizationMode.SEO: return 'bg-blue-500';
      case OptimizationMode.ACADEMIC: return 'bg-slate-700';
      default: return 'bg-brand-500';
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case OptimizationMode.DETECT: return 'AI 内容检测器';
      case OptimizationMode.HUMANIZE: return '拟人化与去 AI 味';
      case OptimizationMode.TOUTIAO: return '今日头条爆款优化';
      case OptimizationMode.WECHAT: return '微信公众号推文优化';
      case OptimizationMode.SEO: return 'SEO 搜索引擎优化';
      case OptimizationMode.ACADEMIC: return '学术论文润色';
      default: return '内容优化工具';
    }
  };

  const getModeDesc = () => {
    switch (mode) {
      case OptimizationMode.DETECT: return '逐句分析文本模式，精确定位 AI 生成痕迹。';
      case OptimizationMode.HUMANIZE: return '优化 AI 生成的文本，使其听起来自然且像人类写作。';
      case OptimizationMode.TOUTIAO: return '优化点击率、标题和互动性。';
      case OptimizationMode.WECHAT: return '增强故事性、排版和情感共鸣。';
      case OptimizationMode.SEO: return '优化关键词密度和搜索排名结构。';
      case OptimizationMode.ACADEMIC: return '确保专业术语、逻辑严密和学术规范。';
      default: return '优化内容以适应特定平台和目标。';
    }
  };

  // Helper for Detect Mode Highlighting
  const getHighlightClass = (probability: number) => {
    if (probability >= 80) return 'bg-red-200 border-red-300 text-red-900';
    if (probability >= 60) return 'bg-orange-100 border-orange-200 text-orange-900';
    if (probability >= 40) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    return 'hover:bg-green-50 border-transparent text-slate-800'; // Low prob
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        currentMode={mode} 
        setMode={setMode} 
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-800">ContentAlchemy</span>
          <div className="w-6" /> {/* Spacer */}
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className={`w-3 h-8 rounded-full ${getModeColor()}`}></span>
                  {getModeTitle()}
                </h2>
                <p className="text-slate-500 mt-1">
                  {getModeDesc()}
                </p>
              </div>
            </div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
              
              {/* Left Column: Input */}
              <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">输入内容</span>
                  <button 
                    onClick={() => setInputText('')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="清空文本"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
                <div className="flex-1 relative">
                  <textarea
                    className="w-full h-full p-6 resize-none focus:outline-none text-slate-700 leading-relaxed text-lg bg-white"
                    placeholder="在此处粘贴您的内容..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  {/* Floating Action Button */}
                  <div className="absolute bottom-6 right-6">
                    <button
                      onClick={handleProcess}
                      disabled={loading || !inputText.trim()}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                        loading ? 'bg-slate-800 cursor-wait' : 'bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white'
                      }`}
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                      {loading ? '处理中...' : (mode === OptimizationMode.DETECT ? '开始检测' : '开始优化')}
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                  <span>{inputText.length} 字符</span>
                  <span>{inputText.split(/[\s,]+/).filter(w => w.length > 0).length} 词</span>
                </div>
              </div>

              {/* Right Column: Output */}
              <div className="flex flex-col gap-6 h-full overflow-y-auto lg:overflow-visible">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-red-500" />
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {!result && !loading && !error && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-100/50 rounded-2xl border border-dashed border-slate-300">
                    <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                      <ArrowRight size={32} className="text-slate-300" />
                    </div>
                    <p className="font-medium">准备就绪</p>
                    <p className="text-sm opacity-70">
                      {mode === OptimizationMode.DETECT ? '检测结果将显示在这里' : '优化结果将显示在这里'}
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                    <Loader2 className="animate-spin text-brand-500 mb-4" size={48} />
                    <p className="animate-pulse font-medium text-slate-600">正在深入分析...</p>
                    <p className="text-xs mt-2 text-slate-400">正在咨询语言模型专家</p>
                  </div>
                )}

                {result && (
                  <>
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-50 to-transparent rounded-bl-full -mr-4 -mt-4"></div>
                        <h4 className="text-sm font-semibold text-slate-500 mb-2 z-10 relative">
                          {mode === 'DETECT' ? 'AI 概率总评' : '效果预估与评分'}
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 -ml-4">
                            <ResultMetrics 
                              mode={mode} 
                              originalScore={result.originalScore || 0} 
                              predictionScore={result.predictionScore || 0}
                            />
                          </div>
                          <div className="flex-1 z-10">
                             <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">{mode === 'DETECT' ? '综合 AI 概率' : '初始评分'}</span>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div style={{ width: `${result.originalScore}%` }} className={`h-full ${mode === 'DETECT' && (result.originalScore || 0) > 50 ? 'bg-red-400' : 'bg-slate-400'}`}></div>
                                </div>
                             </div>
                             <div className="flex flex-col gap-1 mt-2">
                                <span className="text-xs text-slate-400">{mode === 'DETECT' ? '人类可信度' : '优化后预估'}</span>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div style={{ width: `${result.predictionScore}%` }} className="h-full bg-brand-500"></div>
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                         <h4 className="text-sm font-semibold text-slate-500 mb-3">
                           {mode === 'DETECT' ? '诊断分析' : 'AI 诊断与关键词'}
                         </h4>
                         <p className="text-sm text-slate-700 leading-relaxed mb-3 italic">
                           "{result.critique}"
                         </p>
                         <div className="flex flex-wrap gap-2">
                           {result.keywords?.map((kw, i) => (
                             <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium border border-slate-200">#{kw}</span>
                           ))}
                         </div>
                      </div>
                    </div>

                    {/* Rewritten/Analyzed Content */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-brand-100 bg-brand-50/50 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                           <Sparkles size={16} className="text-brand-600" />
                           <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">
                             {mode === 'DETECT' ? '逐句检测报告' : '优化结果'}
                           </span>
                         </div>
                         <div className="flex items-center gap-2">
                           {mode === 'DETECT' && (
                             <div className="flex items-center gap-3 mr-4 text-[10px] text-slate-500 font-medium">
                               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div>疑似 AI</div>
                               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-300"></div>混合</div>
                               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div>人类</div>
                             </div>
                           )}
                           <button 
                             onClick={() => copyToClipboard(result.rewrittenText)}
                             className="text-brand-600 hover:text-brand-800 hover:bg-brand-100 p-2 rounded-lg transition-colors"
                             title="复制结果"
                           >
                             <Copy size={18} />
                           </button>
                         </div>
                      </div>
                      
                      <div className="p-6 overflow-y-auto flex-1 bg-white relative">
                        {mode !== 'DETECT' && (
                          <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
                             <h5 className="flex items-center gap-2 font-bold text-green-800 text-sm mb-2">
                               <CheckCircle2 size={16} /> 关键改进点
                             </h5>
                             <ul className="list-disc list-inside space-y-1">
                               {result.suggestions.map((s, i) => (
                                 <li key={i} className="text-sm text-green-900/80">{s}</li>
                               ))}
                             </ul>
                          </div>
                        )}

                        {/* Content Rendering */}
                        <div className="prose prose-slate max-w-none text-slate-800 leading-loose">
                          {mode === OptimizationMode.DETECT && result.sentenceAnalysis ? (
                             <div className="space-y-1">
                               {result.sentenceAnalysis.map((item, idx) => (
                                 <span 
                                   key={idx}
                                   className={`inline-block mr-1 px-1 py-0.5 rounded border-b-2 transition-all cursor-help relative group ${getHighlightClass(item.aiProbability)}`}
                                 >
                                   {item.text}
                                   {/* Tooltip */}
                                   <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                     AI 概率: {item.aiProbability}%
                                   </span>
                                 </span>
                               ))}
                             </div>
                          ) : (
                            <div className="whitespace-pre-wrap font-medium">
                              {result.rewrittenText}
                            </div>
                          )}
                        </div>

                        {/* Generated Images Section */}
                        {result.generatedImages && result.generatedImages.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-slate-100">
                            <h5 className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-4">
                              <ImageIcon size={16} className="text-brand-600" /> 
                              AI 智能配图 ({result.generatedImages.length})
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                              {result.generatedImages.map((imgData, idx) => (
                                <div key={idx} className="group relative rounded-xl overflow-hidden shadow-sm border border-slate-200 aspect-square bg-slate-50">
                                  <img 
                                    src={imgData} 
                                    alt={`Generated visualization ${idx + 1}`} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <a 
                                      href={imgData} 
                                      download={`ai-generated-image-${idx}.png`}
                                      className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-brand-600 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                                      title="下载图片"
                                    >
                                      <Download size={20} />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-slate-400 italic">
                              * 图片由 Gemini 2.5 Flash Image 生成，仅供参考。
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;