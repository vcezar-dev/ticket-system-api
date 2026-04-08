import { registerAs } from '@nestjs/config';
import { env } from './env.validation';

export default registerAs('jwt', () => ({
  secret: env.JWT_SECRET,
  audience: env.JWT_AUDIENCE,
  issuer: env.JWT_ISSUER,
  accessTokenTtl: env.JWT_ACCESS_TOKEN_TTL,
  refreshTokenTtl: env.JWT_REFRESH_TOKEN_TTL,
}));
