import { Role } from '../../src/users/enums/role.enum';

export const adminOverrides = {
  name: 'admin',
  email: 'admin@email.com',
  role: Role.Admin,
};

export const agentOverrides = {
  name: 'agent',
  email: 'agent@email.com',
  role: Role.Agent,
};
