import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/lib/openai';
import { callGemini } from '@/lib/gemini';
import { buildUrlAnalysisPrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const { url, model, apiKey } = await req.json();

    if (!url || !apiKey) {
      return NextResponse.json(
        { error: 'URL과 API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    // Fetch page content
    let pageContent = '';
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      const html = await res.text();

      // Extract text from HTML - strip tags and scripts
      pageContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000); // Limit content length
    } catch {
      return NextResponse.json(
        { error: 'URL 페이지를 가져올 수 없습니다.' },
        { status: 400 }
      );
    }

    if (!pageContent) {
      return NextResponse.json(
        { error: '페이지 내용을 추출할 수 없습니다.' },
        { status: 400 }
      );
    }

    const prompt = buildUrlAnalysisPrompt(pageContent);
    let result: string;

    if (model === 'gemini') {
      result = await callGemini(apiKey, prompt);
    } else {
      result = await callOpenAI(apiKey, prompt);
    }

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: '분석 결과를 파싱할 수 없습니다.' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Analyze URL error:', error);
    return NextResponse.json(
      { error: 'URL 분석에 실패했습니다.' },
      { status: 500 }
    );
  }
}
