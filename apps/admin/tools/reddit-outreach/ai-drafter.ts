import { GoogleGenAI } from '@google/genai';
import { RedditPost } from './types';

export class AIDrafter {
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  async generateResponse(post: RedditPost): Promise<string> {
    const model = 'gemini-2.0-flash-exp';

    const prompt = `You are a helpful medical spa industry expert who provides authentic, valuable advice on Reddit.

Original Post:
Title: ${post.title}
Body: ${post.body}

Write a helpful, natural comment that:
1. Provides genuine value and expertise
2. Sounds human and conversational (not marketing-y)
3. Relates to medical spa software/operations if relevant
4. Is brief (2-3 sentences max)
5. Does NOT include links or direct promotion
6. Uses natural Reddit language

Generate only the comment text, nothing else.`;

    const result = await this.genAI.models.generateContent({
      model: model,
      contents: prompt,
    });
    return result.text?.trim() || '';
  }

  async improveResponse(original: string, userFeedback: string): Promise<string> {
    const model = 'gemini-2.0-flash-exp';

    const prompt = `Improve this Reddit comment based on feedback:

Original: ${original}
Feedback: ${userFeedback}

Generate the improved comment (2-3 sentences max, natural Reddit language):`;

    const result = await this.genAI.models.generateContent({
      model: model,
      contents: prompt,
    });
    return result.text?.trim() || '';
  }
}
