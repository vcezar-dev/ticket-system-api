import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/enums/role.enum';

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
