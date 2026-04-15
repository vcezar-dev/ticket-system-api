import { Ticket } from '../../tickets/entities/ticket.entity';
import { Category } from '../../tickets/enums/category.enum';
import { Priority } from '../../tickets/enums/priority.enum';
import { Status } from '../../tickets/enums/status.enum';
import { User } from '../../users/entities/user.entity';
import { createMockUser } from './user.factory';

export const createMockTicket = (
  overrides?: Partial<Ticket>,
  user?: User,
): Ticket => ({
  id: 'ticket-test-uuid',
  title: 'ticket-test-title',
  description: 'Description of the ticket test',
  category: Category.Support,
  priority: Priority.Low,
  status: Status.Open,
  createdBy: user ?? createMockUser(),
  assignedTo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
