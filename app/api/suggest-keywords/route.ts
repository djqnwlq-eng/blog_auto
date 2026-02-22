import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/lib/openai';
import { callGemini } from '@/lib/gemini';
import { buildSubKeywordPrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const { keyword, model, apiKey } = await req.json();

    if (!keyword || !apiKey) {
      return NextResponse.json(
        { error: '키워드와 API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    const prompt = buildSubKeywordPrompt(keyword);
    let result: string;

    if (model === 'gemini') {
      result = await callGemini(apiKey, prompt);
    } else {
      result = await callOpenAI(apiKey, prompt);
    }

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: '응답을 파싱할 수 없습니다.' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ keywords: parsed.keywords });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Suggest keywords error:', message);
    return NextResponse.json(
      { error: `서브 키워드 추천 실패: ${message}` },
      { status: 500 }
    );
  }
}
