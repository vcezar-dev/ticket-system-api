import { ConfigType } from '@nestjs/config';
import { Role } from '../../users/enums/role.enum';
import jwtConfig from '../../config/jwt.config';
import { TokenPayloadDto } from '../../auth/dto/token-payload.dto';
import { LoginDto } from '../../auth/dto/login.dto';

export const createTokenSignArgs = (
  sub: string,
  role: Role,
  jwtConfiguration: ConfigType<typeof jwtConfig>,
) => {
  const accessTokenArgs = [
    {
      sub,
      role,
    },
    {
      audience: jwtConfiguration.audience,
      issuer: jwtConfiguration.issuer,
      secret: jwtConfiguration.secret,
      expiresIn: jwtConfiguration.accessTokenTtl,
    },
  ];

  const refreshTokenArgs = [
    {
      sub,
      role,
    },
    {
      audience: jwtConfiguration.audience,
      issuer: jwtConfiguration.issuer,
      secret: jwtConfiguration.secret,
      expiresIn: jwtConfiguration.refreshTokenTtl,
    },
  ];

  return {
    accessTokenArgs,
    refreshTokenArgs,
  };
};

export const createMockTokenPayload = (
  overrides?: Partial<TokenPayloadDto>,
): TokenPayloadDto => ({
  sub: 'test-uuid',
  role: Role.User,
  iat: 0,
  exp: 0,
  iss: '',
  aud: '',
  ...overrides,
});

export const createMockLoginDto = (
  overrides?: Partial<LoginDto>,
): LoginDto => ({
  email: 'usertest@email.com',
  password: 'password-test',
  ...overrides,
});

export const createMockJwtConfig = (
  overrides?: Partial<ConfigType<typeof jwtConfig>>,
): ConfigType<typeof jwtConfig> => ({
  secret: 'test-secret',
  audience: 'http://localhost:3000',
  issuer: 'http://localhost:3000',
  accessTokenTtl: 3600,
  refreshTokenTtl: 604800,
  ...overrides,
});
