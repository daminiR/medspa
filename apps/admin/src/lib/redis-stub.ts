/**
 * Redis stub for when @upstash packages are not installed
 * The messaging service handles Redis being null gracefully
 */

export class Redis {
  constructor(_config: { url?: string; token?: string }) {
    // Stub implementation
  }

  async zadd(_key: string, _data: { score: number; member: string }): Promise<number> {
    return 0;
  }

  async zrangebyscore(_key: string, _min: number, _max: number): Promise<string[]> {
    return [];
  }

  async zrem(_key: string, _member: string): Promise<number> {
    return 0;
  }

  async rpush(_key: string, _value: string): Promise<number> {
    return 0;
  }
}

export class Ratelimit {
  static slidingWindow(_limit: number, _window: string) {
    return {};
  }

  constructor(_config: { redis: Redis; limiter: any }) {
    // Stub implementation
  }

  async limit(_key: string): Promise<{ success: boolean; remaining: number }> {
    return { success: true, remaining: 100 };
  }
}
