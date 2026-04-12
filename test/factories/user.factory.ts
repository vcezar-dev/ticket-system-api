import { TokenPayloadDto } from '../../src/auth/dto/token-payload.dto';
import { User } from '../../src/users/entities/user.entity';
import { Role } from '../../src/users/enums/role.enum';

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

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'test-uuid',
  name: 'username',
  email: 'user@email.com',
  passwordHash: 'hashed-password',
  role: Role.User,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
