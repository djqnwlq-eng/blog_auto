import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/lib/openai';
import { callGemini } from '@/lib/gemini';
import { buildTitlePrompt, buildContentPrompt, buildThreadPrompt } from '@/lib/prompts';
import { ContentRatio, ProductConnection } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, model, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    const callAI = model === 'gemini'
      ? (prompt: string) => callGemini(apiKey, prompt)
      : (prompt: string) => callOpenAI(apiKey, prompt);

    if (action === 'titles') {
      const { keyword, subKeywords, productInfo } = body;
      const prompt = buildTitlePrompt(keyword, subKeywords || [], productInfo || '');
      const result = await callAI(prompt);

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: '제목 생성 실패' }, { status: 500 });
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ titles: parsed.titles });
    }

    if (action === 'content') {
      const {
        title,
        keyword,
        subKeywords,
        persona,
        contentRatio,
        productConnection,
        productInfo,
        sellingPoints,
      } = body;

      const prompt = buildContentPrompt({
        title,
        keyword,
        subKeywords: subKeywords || [],
        persona,
        contentRatio: contentRatio as ContentRatio,
        productConnection: productConnection as ProductConnection,
        productInfo: productInfo || '',
        sellingPoints: sellingPoints || [],
      });

      const result = await callAI(prompt);
      return NextResponse.json({ content: result });
    }

    if (action === 'thread') {
      const { blogContent } = body;
      const prompt = buildThreadPrompt(blogContent);
      const result = await callAI(prompt);

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: '스레드 변환 실패' }, { status: 500 });
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: '알 수 없는 액션' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Generate error:', message);
    return NextResponse.json(
      { error: `API 호출 실패: ${message}` },
      { status: 500 }
    );
  }
}
