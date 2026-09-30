import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: 'AIzaSyDezHN6KDSX0gFGKWLlhHDR9ckuA0FMcLQ' });
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Hello",
    });
    console.log('success gemini-3-flash-preview');
  } catch(e: any) {
    console.log('error gemini-3-flash-preview', e.status, e.message);
  }
}

test();
