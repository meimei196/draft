import { GoogleGenAI } from '@google/genai';

async function verify(key) {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: "Hello",
    });
    console.log('✅ success');
  } catch (e) {
    if (e.status === 400) {
      console.log('API Key không hợp lệ. Vui lòng kiểm tra lại.');
    } else if (e.status === 429) {
      console.log('Model này đã hết hạn mức (Quota).');
    } else if (e.status === 404) {
      console.log('Model này không hỗ trợ. Vui lòng chọn Model khác.');
    } else {
      console.log('Lỗi không xác định.');
    }
  }
}

verify('AIzaSyDezHN6KDSX0gFGKWLlhHDR9ckuA0FMcLQ');
verify('ab');
