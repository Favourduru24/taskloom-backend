import { registerAs } from '@nestjs/config';

export interface AppConfig {
  clientBaseUrl: string;
  apiBaseUrl: string;
  nodeEnv: string;
  port: number;
  allowedOrigins: string[];
}

function normalizeOrigins(raw: string | undefined): string[] {
  if (!raw) return [];
  const val = raw.trim();
  const parts = val.startsWith('[')
    ? (JSON.parse(val) as string[])
    : val.split(',');

  const cleaned = parts
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .map((s) => s.replace(/\/+$/, ''));

  const withLocalVariants = new Set<string>(cleaned);
  for (const o of cleaned) {
    try {
      const u = new URL(o);
      if (u.hostname === 'localhost') {
        withLocalVariants.add(
          `${u.protocol}//127.0.0.1${u.port ? `:${u.port}` : ''}`,
        );
      }
      if (u.hostname === '127.0.0.1') {
        withLocalVariants.add(
          `${u.protocol}//localhost${u.port ? `:${u.port}` : ''}`,
        );
      }
    } catch {}
  }

  return Array.from(withLocalVariants);
}

export const AppConfiguration = registerAs(
  'appConfig',
  (): AppConfig => ({
    clientBaseUrl: process.env.CLIENT_BASE_URL ?? 'http://localhost:3000',
    apiBaseUrl: process.env.API_BASE_URL ?? '',
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    allowedOrigins: normalizeOrigins(process.env.ALLOWED_ORIGINS),
  }),
);
