/**
 * Vertex AI Gemini Client
 *
 * Wrapper for Google's GenAI SDK configured for Vertex AI.
 * Uses Gemini 3 Flash for frontier-grade reasoning at fast speeds.
 */

import { GoogleGenAI } from '@google/genai';

interface GeminiConfig {
  project?: string;
  location?: string;
  model?: string;
}

interface GenerateOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
}

interface StructuredGenerateOptions {
  systemInstruction?: string;
  model?: string;
}

class GeminiClient {
  private client: GoogleGenAI;
  private defaultModel: string;
  private isConfigured: boolean = false;

  constructor(config: GeminiConfig = {}) {
    const project = config.project || process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const location = config.location || process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    if (!project) {
      console.warn('GeminiClient: No project ID configured. AI features will use fallback responses.');
      this.isConfigured = false;
      // Create a dummy client - will fail gracefully
      this.client = {} as GoogleGenAI;
    } else {
      this.client = new GoogleGenAI({
        vertexai: true,
        project,
        location,
      });
      this.isConfigured = true;
    }

    this.defaultModel = config.model || 'gemini-3-flash';
  }

  /**
   * Check if Gemini is properly configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Generate text content from a prompt
   */
  async generateContent(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    if (!this.isConfigured) {
      console.warn('GeminiClient: Not configured, returning fallback');
      return 'Thank you for your message. A team member will respond shortly.';
    }

    try {
      const response = await this.client.models.generateContent({
        model: options.model || this.defaultModel,
        contents: prompt,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? 0.3,
          maxOutputTokens: options.maxOutputTokens ?? 1024,
        },
      });

      return response.text || '';
    } catch (error) {
      console.error('GeminiClient generateContent error:', error);
      throw error;
    }
  }

  /**
   * Generate structured JSON output from a prompt
   */
  async generateStructured<T>(
    prompt: string,
    schema: object,
    options: StructuredGenerateOptions = {}
  ): Promise<T> {
    if (!this.isConfigured) {
      throw new Error('GeminiClient not configured');
    }

    try {
      const response = await this.client.models.generateContent({
        model: options.model || this.defaultModel,
        contents: prompt,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const text = response.text || '{}';
      return JSON.parse(text) as T;
    } catch (error) {
      console.error('GeminiClient generateStructured error:', error);
      throw error;
    }
  }

  /**
   * Count tokens in content (for cost estimation)
   */
  async countTokens(content: string): Promise<number> {
    if (!this.isConfigured) {
      // Rough estimate: ~4 chars per token
      return Math.ceil(content.length / 4);
    }

    try {
      const response = await this.client.models.countTokens({
        model: this.defaultModel,
        contents: content,
      });
      return response.totalTokens || 0;
    } catch (error) {
      console.error('GeminiClient countTokens error:', error);
      // Fallback estimate
      return Math.ceil(content.length / 4);
    }
  }

  /**
   * Estimate cost in USD for a given token count
   */
  estimateCost(inputTokens: number, outputTokens: number = 0): number {
    // Gemini 3 Flash pricing (per 1M tokens)
    const inputRate = 0.0005; // $0.50 per 1M input tokens
    const outputRate = 0.003; // $3.00 per 1M output tokens

    const inputCost = (inputTokens / 1_000_000) * inputRate;
    const outputCost = (outputTokens / 1_000_000) * outputRate;

    return inputCost + outputCost;
  }
}

// Singleton instance
let clientInstance: GeminiClient | null = null;

/**
 * Get the singleton Gemini client instance
 */
export function getGeminiClient(): GeminiClient {
  if (!clientInstance) {
    clientInstance = new GeminiClient();
  }
  return clientInstance;
}

/**
 * Create a new Gemini client with custom configuration
 */
export function createGeminiClient(config: GeminiConfig): GeminiClient {
  return new GeminiClient(config);
}

export { GeminiClient };
export type { GeminiConfig, GenerateOptions, StructuredGenerateOptions };
