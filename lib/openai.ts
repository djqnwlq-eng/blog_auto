import OpenAI from 'openai';

export async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 4000,
  });
  return response.choices[0]?.message?.content || '';
}
