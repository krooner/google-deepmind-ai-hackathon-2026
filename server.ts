import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { SAMPLE_RECEIPT_PRESETS } from './src/data/sampleItems.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION =
  'You are a purchase-record extraction assistant for a Korean personal collection app. Read only information visibly present in the screenshot. Extract each purchasable product separately. Do not invent brand names, dates, prices, or categories. Prefer Korean product names when visible. Return valid JSON matching the requested schema and no markdown.';

const EXTRACTION_PROMPT = `업로드된 주문 완료 화면 또는 주문 확인서 이미지를 읽고 다음 JSON 스키마에 맞춰 상품 정보를 추출하세요. 보이지 않거나 확신할 수 없는 값은 null로 두세요. 추측해서 채우지 마세요.`;

function getFallbackExtraction(presetId?: string, fileName?: string) {
  if (presetId) {
    const found = SAMPLE_RECEIPT_PRESETS.find((p) => p.id === presetId);
    if (found) {
      return {
        items: [found.extracted],
        source: 'fallback' as const,
      };
    }
  }

  const lowerName = (fileName || '').toLowerCase();
  if (lowerName.includes('aesop') || lowerName.includes('olive') || lowerName.includes('뷰티')) {
    return {
      items: [SAMPLE_RECEIPT_PRESETS[1].extracted],
      source: 'fallback' as const,
    };
  }
  if (lowerName.includes('tumbler') || lowerName.includes('29cm') || lowerName.includes('fellow')) {
    return {
      items: [SAMPLE_RECEIPT_PRESETS[2].extracted],
      source: 'fallback' as const,
    };
  }

  // Default PRD fallback: 무신사 주문 완료 예시 데이터
  return {
    items: [SAMPLE_RECEIPT_PRESETS[0].extracted],
    source: 'fallback' as const,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.post('/api/analyze-receipt', async (req, res) => {
    const { imageBase64, mimeType, presetId, fileName } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey =
      Boolean(apiKey) &&
      apiKey !== 'MY_GEMINI_API_KEY' &&
      apiKey !== 'YOUR_API_KEY' &&
      apiKey!.trim().length > 10;

    // If a built-in SVG demo preset was chosen or API key is not configured, use realistic extraction
    if (!hasValidKey || !imageBase64 || mimeType === 'image/svg+xml') {
      const fallback = getFallbackExtraction(presetId, fileName);
      return res.json({
        ...fallback,
        fallbackReason: !hasValidKey
          ? 'GEMINI_API_KEY 미설정으로 무신사/주문완료 데모 추출 데이터가 적용되었습니다.'
          : undefined,
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const cleanBase64 = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/png',
                data: cleanBase64,
              },
            },
            {
              text: EXTRACTION_PROMPT,
            },
          ],
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    brand: { type: Type.STRING, nullable: true },
                    name: { type: Type.STRING, nullable: true },
                    category: {
                      type: Type.STRING,
                      enum: ['clothing', 'beauty', 'watch_jewelry', 'merch', 'other'],
                    },
                    purchaseDate: { type: Type.STRING, nullable: true },
                    price: { type: Type.NUMBER, nullable: true },
                    currency: {
                      type: Type.STRING,
                      enum: ['KRW', 'USD', 'OTHER'],
                    },
                    store: { type: Type.STRING, nullable: true },
                    quantity: { type: Type.INTEGER },
                    confidence: { type: Type.NUMBER },
                    evidence: { type: Type.STRING },
                  },
                  required: [
                    'brand',
                    'name',
                    'category',
                    'purchaseDate',
                    'price',
                    'currency',
                    'store',
                    'quantity',
                    'confidence',
                    'evidence',
                  ],
                },
              },
            },
            required: ['items'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Empty response from Gemini model');
      }

      const parsed = JSON.parse(rawText.trim());
      if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
        throw new Error('No items extracted from response');
      }

      return res.json({
        items: parsed.items,
        source: 'gemini',
      });
    } catch (error) {
      console.warn('Gemini receipt extraction fallback triggered:', error);
      const fallback = getFallbackExtraction(presetId, fileName);
      return res.json({
        ...fallback,
        fallbackReason:
          '실시간 AI 호출 대신 안정적인 무신사 주문 완료 샘플 추출 결과를 불러왔습니다. 모든 항목을 자유롭게 수정해 저장할 수 있습니다.',
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use(express.static(path.resolve(__dirname, 'public')));
    app.use('/src/assets', express.static(path.resolve(__dirname, 'src', 'assets')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`OneShelf server listening on http://localhost:${port}`);
  });
}

startServer();
