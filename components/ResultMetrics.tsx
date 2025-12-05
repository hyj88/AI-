import React from 'react';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  PolarAngleAxis 
} from 'recharts';
import { OptimizationMode } from '../types';

interface ResultMetricsProps {
  mode: OptimizationMode;
  originalScore: number;
  predictionScore: number;
}

export const ResultMetrics: React.FC<ResultMetricsProps> = ({ mode, originalScore, predictionScore }) => {
  
  const isDetectMode = mode === OptimizationMode.DETECT;

  const data = [
    {
      name: isDetectMode ? 'AI 疑似度' : '初始质量',
      value: originalScore,
      fill: isDetectMode && originalScore > 50 ? '#ef4444' : '#94a3b8',
    },
    {
      name: isDetectMode ? '人类可信度' : '预估效果',
      value: predictionScore,
      fill: '#0ea5e9',
    }
  ];

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="45%" 
          outerRadius="100%" 
          barSize={10} 
          data={data}
          startAngle={90} 
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            // Removed label and legend to prevent clutter in small containers
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <p className="text-xl font-bold text-slate-800 leading-none">{predictionScore}</p>
      </div>
    </div>
  );
};