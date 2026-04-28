import { TestingModule } from '@nestjs/testing';
import { Ticket } from '../../src/tickets/entities/ticket.entity';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Priority } from '../../src/tickets/enums/priority.enum';
import { Category } from '../../src/tickets/enums/category.enum';
import { Status } from '../../src/tickets/enums/status.enum';
import { User } from '../../src/users/entities/user.entity';
import { Comment } from '../../src/comments/entities/comment.entity';

export async function seedTicket(
  moduleFixture: TestingModule,
  user?: User,
  overrides?: Partial<Ticket>,
) {
  const dataSource = moduleFixture.get(DataSource);
  const ticketRepository = dataSource.getRepository(Ticket);

  const ticket = await ticketRepository.save({
    id: randomUUID(),
    title: 'ticket-title',
    description: 'Description of the ticket',
    status: Status.Open,
    priority: Priority.Low,
    category: Category.Support,
    createdBy: user || null,
    ...overrides,
  });

  return ticket;
}

export async function seedComment(
  moduleFixture: TestingModule,
  ticket: Ticket,
  user?: User,
  overrides?: Partial<Comment>,
) {
  const dataSource = moduleFixture.get(DataSource);
  const CommentRepository = dataSource.getRepository(Comment);

  await CommentRepository.save({
    id: randomUUID(),
    content: 'test comment',
    ticket: ticket,
    author: user || null,
    ...overrides,
  });
}
