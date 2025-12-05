import { GoogleGenAI, Type } from "@google/genai";
import { OptimizationMode, AnalysisResult } from "../types";

const TEXT_MODEL_NAME = 'gemini-2.5-flash';
const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';

// Lazy load the AI client to allow for runtime API_KEY checks
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("未配置 API Key。请在项目根目录创建 .env 文件并写入 API_KEY=你的Key，或在启动命令中设置环境变量。");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to construct prompts based on mode
const getSystemInstruction = (mode: OptimizationMode): string => {
  const baseInstruction = `你是一名中文内容优化专家。`;
  
  const imageInstruction = `
  此外，请为该文章构思 2-4 个生动、具体的**英文**画面描述（image prompts）。
  这些描述将用于 AI 绘画模型生成配图，必须是英语，描述具体的场景、光影、风格（如写实摄影、极简插画等）。
  `;

  switch (mode) {
    case OptimizationMode.DETECT:
      return `你是一名高级语言取证专家，精通中文语境。你的任务是分析文本中的“AI 伪影”。
      
      请执行以下操作：
      1. 分析全文的 AI 生成概率（originalScore）。
      2. 将文本拆分为独立的句子，并针对每一句话分析其“AI 味道”（aiProbability）。高概率意味着该句子使用了典型的 AI 句式、连接词或缺乏人类的情感特征。
      3. 必须在返回的 sentenceAnalysis 数组中包含完整的文本，不要遗漏任何句子。
      
      注意：检测重点在于重复的句式、缺乏困惑度（perplexity）、过度使用的连接词（如“此外”、“综上所述”）以及通用的情感基调。不需要生成图片提示词。`;
    
    case OptimizationMode.HUMANIZE:
      return `${baseInstruction} 你的目标是“去 AI 化”。重写文本，使其听起来自然、多变且引人入胜。使用成语、变化的句长和真实的情感细微差别。避免常见的 AI 触发词（如“揭示”、“深入探讨”、“格局”、“强调”等翻译腔）。使其能够通过 AI 检测工具。请仅输出纯文本，严禁使用任何 Markdown 格式（如加粗、标题、列表符号等），保持自然段落。${imageInstruction}`;
    
    case OptimizationMode.TOUTIAO:
      return `${baseInstruction} 你是今日头条（ByteDance）的爆款内容专家。优化内容以获得高点击率（CTR）和互动率。使用悬念、强烈的情感触发和紧迫的语言。重点关注前三行。生成一个吸引人的标题。${imageInstruction}`;

    case OptimizationMode.WECHAT:
      return `${baseInstruction} 你是顶级的微信公众号运营者。重写内容，使其具有对话性、故事驱动和高度的可分享性。使用亲切的“IP”人设。打断长段落。专注于情感共鸣和“金句”。${imageInstruction}`;

    case OptimizationMode.SEO:
      return `${baseInstruction} 你是一名 SEO 专家。针对搜索引擎（百度/Google）优化内容。关注关键词密度、清晰的 H2/H3 结构、可读性和摘要优化。确保内容直接回答用户意图。无需生成图片提示词。`;

    case OptimizationMode.ACADEMIC:
      return `${baseInstruction} 你是一名资深学术编辑。针对学术发表优化文本。确保语气正式、精准、逻辑流畅且术语正确。去除口语化表达。提高清晰度和简洁性。无需生成图片提示词。`;
    
    default:
      return `你是一个有用的中文写作助手。`;
  }
};

const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // responseMimeType is not supported for image generation models
        // We let the model determine the best aspect ratio or use default
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.warn("Failed to generate image for prompt:", prompt, error);
    return null;
  }
};

export const processContent = async (
  text: string, 
  mode: OptimizationMode
): Promise<AnalysisResult> => {
  if (!text.trim()) {
    throw new Error("内容不能为空");
  }

  const systemInstruction = getSystemInstruction(mode);
  
  // We use a structured JSON schema to ensure the UI can render charts and results easily.
  const schema = {
    type: Type.OBJECT,
    properties: {
      originalScore: { type: Type.NUMBER, description: "0-100 分。对于 'DETECT'，它是全文 AI 概率。对于其他模式，它是初始质量分数。" },
      predictionScore: { type: Type.NUMBER, description: "0-100 的预测分数，表示输出内容的表现（爆款潜力、SEO 排名或拟人化程度）。" },
      critique: { type: Type.STRING, description: "对原文问题的简要分析（使用中文）。" },
      suggestions: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "3-5 条具体的修改或改进建议（使用中文）。"
      },
      rewrittenText: { type: Type.STRING, description: "完整的优化或重写后的内容（使用中文）。如果是 DETECT 模式，请返回原文。" },
      keywords: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "提取的关键词或标签（使用中文）。"
      },
      sentenceAnalysis: {
        type: Type.ARRAY,
        description: "仅在 DETECT 模式下返回。包含逐句的 AI 概率分析。",
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "句子文本。" },
            aiProbability: { type: Type.NUMBER, description: "该句子由 AI 生成的概率 (0-100)。" }
          }
        }
      },
      imagePrompts: {
        type: Type.ARRAY,
        description: "2-4 个用于生成配图的英文 Prompt。仅在 TOUTIAO, WECHAT, HUMANIZE 模式下返回。",
        items: { type: Type.STRING }
      }
    },
    required: ["originalScore", "predictionScore", "critique", "suggestions", "rewrittenText"],
    propertyOrdering: ["originalScore", "predictionScore", "critique", "suggestions", "rewrittenText", "keywords", "sentenceAnalysis", "imagePrompts"]
  };

  try {
    const ai = getAiClient();
    
    // 1. Generate Text Analysis & Rewriting
    const response = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [{ text: `请根据你的系统指令分析并处理以下文本。文本: "${text}"` }]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: mode === OptimizationMode.ACADEMIC ? 0.2 : 0.7,
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("AI 没有响应");
    
    const result = JSON.parse(jsonText) as AnalysisResult;

    // 2. Generate Images if prompts exist (Parallel execution)
    if (result.imagePrompts && result.imagePrompts.length > 0) {
      // Use max 4 images to save resources/time
      const promptsToUse = result.imagePrompts.slice(0, 4);
      const imagePromises = promptsToUse.map(prompt => generateImage(prompt));
      const images = await Promise.all(imagePromises);
      // Filter out nulls
      result.generatedImages = images.filter((img): img is string => img !== null);
    }

    return result;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // If it's our custom error, throw it directly
    if (error.message.includes("API Key")) {
      throw error;
    }
    throw new Error("处理内容失败，请检查 API Key 或网络连接。");
  }
};