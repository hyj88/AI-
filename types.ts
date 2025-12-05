export enum OptimizationMode {
  DETECT = 'DETECT',
  HUMANIZE = 'HUMANIZE',
  TOUTIAO = 'TOUTIAO',
  WECHAT = 'WECHAT',
  SEO = 'SEO',
  ACADEMIC = 'ACADEMIC',
}

export interface SentenceAnalysis {
  text: string;
  aiProbability: number; // 0-100
}

export interface AnalysisResult {
  originalScore?: number; // 0-100, where 100 is highly likely AI
  humanizedScore?: number; // Prediction of human-likeness after edit
  predictionScore?: number; // Viral/SEO/Academic quality score
  critique: string;
  suggestions: string[];
  rewrittenText: string;
  keywords?: string[]; // For SEO/Toutiao
  sentenceAnalysis?: SentenceAnalysis[]; // New field for detailed DETECT breakdown
  imagePrompts?: string[]; // Prompts for generating images
  generatedImages?: string[]; // Base64 strings of generated images
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fullMark: number;
}