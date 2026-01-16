/**
 * OpenAI Integration
 *
 * Uses real OpenAI API when OPENAI_API_KEY is configured.
 * Falls back to mock responses for development without API key.
 */

import OpenAISDK from 'openai';

// Types for compatibility
interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string;
  };
  finish_reason: string;
}

interface ChatCompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
}

// Check if we have a valid API key
const apiKey = process.env.OPENAI_API_KEY;
const hasValidApiKey = apiKey && apiKey.length > 10 && !apiKey.includes('your-');

// Export flag for consumers to check
export const isUsingRealOpenAI = hasValidApiKey;

/**
 * OpenAI wrapper class that uses real API when configured,
 * falls back to mock responses when not.
 */
export class OpenAI {
  private realClient: OpenAISDK | null = null;
  private useReal: boolean;

  constructor(config: { apiKey?: string }) {
    this.useReal = !!(config.apiKey && config.apiKey.length > 10 && !config.apiKey.includes('your-'));

    if (this.useReal && config.apiKey) {
      this.realClient = new OpenAISDK({ apiKey: config.apiKey });
      console.log('[OpenAI] Using real OpenAI API');
    } else {
      console.log('[OpenAI] No valid API key, using mock responses');
    }
  }

  chat = {
    completions: {
      create: async (params: {
        model: string;
        messages: ChatCompletionMessage[];
        temperature?: number;
        response_format?: { type: string };
      }): Promise<ChatCompletion> => {
        // Use real OpenAI if available
        if (this.useReal && this.realClient) {
          try {
            const response = await this.realClient.chat.completions.create({
              model: params.model,
              messages: params.messages,
              temperature: params.temperature,
              response_format: params.response_format as { type: 'json_object' | 'text' } | undefined,
            });

            // Map to our interface
            return {
              id: response.id,
              object: response.object,
              created: response.created,
              model: response.model,
              choices: response.choices.map((choice, index) => ({
                index,
                message: {
                  role: 'assistant' as const,
                  content: choice.message.content || '',
                },
                finish_reason: choice.finish_reason || 'stop',
              })),
            };
          } catch (error: any) {
            console.error('[OpenAI] API error, falling back to mock:', error.message);
            // Fall through to mock response on error
          }
        }

        // Return mock response for development or on error
        return {
          id: 'mock-completion',
          object: 'chat.completion',
          created: Date.now(),
          model: 'gpt-4-mock',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: JSON.stringify({
                  intent: 'general_inquiry',
                  urgency: 'low',
                  sentiment: 'neutral',
                  confidence: 0.8,
                  suggestedResponse: 'Thank you for your message. How can I assist you today?',
                  requiresHumanReview: false,
                }),
              },
              finish_reason: 'stop',
            },
          ],
        };
      },
    },
  };
}
