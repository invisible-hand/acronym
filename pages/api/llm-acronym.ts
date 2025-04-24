import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { acronym } = req.query;
  if (!acronym || typeof acronym !== 'string') {
    return res.status(400).json({ error: 'No acronym provided' });
  }
  try {
    const prompt = `What does the acronym "${acronym}" most likely stand for in a banking or finance context? Respond with just the most likely expansion, no extra explanation. If there is no common banking/finance meaning, give the most common general meaning.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview', // gpt-4.1-mini
      messages: [
        { role: 'system', content: 'You are a helpful assistant for acronym expansion.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 40,
      temperature: 0.2,
    });
    const meaning = completion.choices?.[0]?.message?.content?.trim() || '';
    res.status(200).json({ meaning });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'AI error' });
  }
}
