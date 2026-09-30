import { GoogleGenAI } from '@google/genai';

async function test(key) {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Hello",
    });
    console.log('success with key:', key);
  } catch(e: any) {
    console.log('error with key:', key, e.status, e.message);
  }
}

test('ab');
test('123');
test('aA');
