/**
 * Application Configuration
 *
 * Loads environment variables and provides typed configuration
 */

export interface Config {
  // Server
  port: number;
  nodeEnv: 'development' | 'production' | 'test';

  // Database
  databaseUrl: string;

  // Firebase
  firebaseProjectId: string;
  firebaseClientEmail?: string;
  firebasePrivateKey?: string;

  // Security
  encryptionKey: string;
  jwtSecret?: string;

  // External Services
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  sendgridApiKey?: string;
  emailFrom?: string;

  // Google Cloud
  gcpProjectId?: string;

  // App Settings
  appUrl: string;
  apiUrl: string;
  corsOrigins: string[];
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

export function loadConfig(): Config {
  const nodeEnv = (process.env.NODE_ENV || 'development') as Config['nodeEnv'];

  // CORS origins based on environment
  const defaultCorsOrigins = nodeEnv === 'development'
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']
    : [];

  const corsOriginsStr = getEnvOptional('CORS_ORIGINS');
  const corsOrigins = corsOriginsStr
    ? corsOriginsStr.split(',').map(s => s.trim())
    : defaultCorsOrigins;

  return {
    // Server
    port: getEnvNumber('PORT', 8080),
    nodeEnv,

    // Database
    databaseUrl: getEnv('DATABASE_URL', 'postgresql://localhost:5432/medical_spa'),

    // Firebase
    firebaseProjectId: getEnv('FIREBASE_PROJECT_ID', 'medical-spa-dev'),
    firebaseClientEmail: getEnvOptional('FIREBASE_CLIENT_EMAIL'),
    firebasePrivateKey: getEnvOptional('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),

    // Security
    encryptionKey: getEnv('ENCRYPTION_KEY', '0'.repeat(64)), // Dummy default for dev
    jwtSecret: getEnvOptional('JWT_SECRET'),

    // External Services
    stripeSecretKey: getEnvOptional('STRIPE_SECRET_KEY'),
    stripeWebhookSecret: getEnvOptional('STRIPE_WEBHOOK_SECRET'),
    twilioAccountSid: getEnvOptional('TWILIO_ACCOUNT_SID'),
    twilioAuthToken: getEnvOptional('TWILIO_AUTH_TOKEN'),
    twilioPhoneNumber: getEnvOptional('TWILIO_PHONE_NUMBER'),
    sendgridApiKey: getEnvOptional('SENDGRID_API_KEY'),
    emailFrom: getEnvOptional('EMAIL_FROM') || 'noreply@luxemedspa.com',

    // Google Cloud
    gcpProjectId: getEnvOptional('GCP_PROJECT_ID'),

    // App Settings
    appUrl: getEnv('APP_URL', 'http://localhost:3000'),
    apiUrl: getEnv('API_URL', 'http://localhost:8080'),
    corsOrigins,
  };
}

// Export singleton config
export const config = loadConfig();
