import React from 'react';
import { OptimizationMode } from '../types';
import { 
  ScanSearch, 
  Sparkles, 
  Flame, 
  MessageCircle, 
  Search, 
  GraduationCap,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  currentMode: OptimizationMode;
  setMode: (mode: OptimizationMode) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, isOpen, toggleSidebar }) => {
  
  const navItems = [
    { mode: OptimizationMode.DETECT, label: 'AI 内容检测', icon: <ScanSearch size={20} />, desc: '检测 AI 生成概率' },
    { mode: OptimizationMode.HUMANIZE, label: '拟人化 (去 AI 味)', icon: <Sparkles size={20} />, desc: '让文本更自然' },
    { mode: OptimizationMode.TOUTIAO, label: '今日头条优化', icon: <Flame size={20} />, desc: '爆款标题与黄金三秒' },
    { mode: OptimizationMode.WECHAT, label: '公众号推文', icon: <MessageCircle size={20} />, desc: '故事感与排版优化' },
    { mode: OptimizationMode.SEO, label: 'SEO 搜索引擎优化', icon: <Search size={20} />, desc: '关键词与排名' },
    { mode: OptimizationMode.ACADEMIC, label: '论文/学术润色', icon: <GraduationCap size={20} />, desc: '专业严谨学术风' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Content */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
              CA
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">ContentAlchemy</h1>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => {
                setMode(item.mode);
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all duration-200 group ${
                currentMode === item.mode 
                  ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200 shadow-sm' 
                  : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={`p-2 rounded-lg ${
                currentMode === item.mode ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'
              }`}>
                {item.icon}
              </span>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-xs mb-1">Powered by</p>
            <p className="text-white font-bold text-sm flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Gemini 2.5 Flash
            </p>
          </div>
        </div>
      </div>
    </>
  );
};