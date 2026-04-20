import { registerAs } from '@nestjs/config';
import type { SignOptions } from 'jsonwebtoken';

export interface AuthConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenTtl: SignOptions['expiresIn'];
  refreshTokenTtl: SignOptions['expiresIn'];
}

export const AuthConfiguration = registerAs(
  'auth',
  (): AuthConfig => ({
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ?? '',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ?? '',
    accessTokenTtl: (process.env.JWT_ACCESS_TTL ?? '1h') as SignOptions['expiresIn'],
    refreshTokenTtl: (process.env.JWT_REFRESH_TTL ?? '30d') as SignOptions['expiresIn'],
  }),
);

