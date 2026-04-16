import { Comment } from '../../comments/entities/comment.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { User } from '../../users/entities/user.entity';
import { createMockTicket } from './ticket.factory';
import { createMockUser } from './user.factory';

export const createMockComment = (
  overrides?: Partial<Comment>,
  user?: User,
  ticket?: Ticket,
): Comment => ({
  id: 'comment-test-uuid',
  content: 'comment-test-content',
  author: user ?? createMockUser(),
  ticket: ticket ?? createMockTicket(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
