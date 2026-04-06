import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_ISSUER,
  accessTokenTtl: Number(process.env.JWT_ACCESS_TOKEN_TTL),
  refreshTokenTtl: Number(process.env.JWT_REFRESH_TOKEN_TTL),
}));
