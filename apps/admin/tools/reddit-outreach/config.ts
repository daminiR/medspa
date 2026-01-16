/**
 * Reddit Outreach Tool Configuration
 *
 * This file loads and validates all required environment variables for the Reddit
 * outreach tool, including Reddit API credentials and OpenAI API key.
 */

interface RedditConfig {
  reddit: {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    userAgent: string;
  };
  openai: {
    apiKey: string;
  };
}

/**
 * Validates that a required environment variable is present
 * @throws Error if the variable is missing or empty
 */
function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n\n` +
      `Please set this in your .env.local file. See .env.local.example for reference.\n` +
      `For Reddit credentials, visit: https://www.reddit.com/prefs/apps\n` +
      `For OpenAI API key, visit: https://platform.openai.com/api-keys`
    );
  }

  return value;
}

/**
 * Validates the Reddit user agent format
 * Should be in format: "AppName/Version by /u/username"
 */
function validateUserAgent(userAgent: string): void {
  if (!userAgent.includes('/') || !userAgent.includes('by')) {
    console.warn(
      'Warning: Reddit user agent should follow the format "AppName/Version by /u/username"\n' +
      `Current value: "${userAgent}"\n` +
      'Recommended format: "MedSpaOutreach/1.0 by /u/your_reddit_username"'
    );
  }
}

/**
 * Load and validate all configuration from environment variables
 * @throws Error if any required variables are missing
 */
function loadConfig(): RedditConfig {
  // Load Reddit API credentials
  const redditClientId = requireEnv('REDDIT_CLIENT_ID');
  const redditClientSecret = requireEnv('REDDIT_CLIENT_SECRET');
  const redditUsername = requireEnv('REDDIT_USERNAME');
  const redditPassword = requireEnv('REDDIT_PASSWORD');
  const redditUserAgent = requireEnv('REDDIT_USER_AGENT');

  // Validate user agent format
  validateUserAgent(redditUserAgent);

  // Load OpenAI API key
  const openaiApiKey = requireEnv('OPENAI_API_KEY');

  // Validate OpenAI API key format
  if (!openaiApiKey.startsWith('sk-')) {
    console.warn(
      'Warning: OpenAI API key should start with "sk-"\n' +
      `Current value starts with: "${openaiApiKey.substring(0, 4)}..."\n` +
      'Please verify your API key is correct.'
    );
  }

  return {
    reddit: {
      clientId: redditClientId,
      clientSecret: redditClientSecret,
      username: redditUsername,
      password: redditPassword,
      userAgent: redditUserAgent,
    },
    openai: {
      apiKey: openaiApiKey,
    },
  };
}

// Export the configuration object
export const config = loadConfig();

// Export individual sections for convenience
export const redditConfig = config.reddit;
export const openaiConfig = config.openai;

// Export types
export type { RedditConfig };
