import { TestingModule } from '@nestjs/testing';
import { Ticket } from '../../src/tickets/entities/ticket.entity';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Priority } from '../../src/tickets/enums/priority.enum';
import { Category } from '../../src/tickets/enums/category.enum';
import { Status } from '../../src/tickets/enums/status.enum';
import { User } from '../../src/users/entities/user.entity';

export async function seedTicket(
  moduleFixture: TestingModule,
  user?: User,
  overrides?: Partial<Ticket>,
) {
  const dataSource = moduleFixture.get(DataSource);
  const ticketRepository = dataSource.getRepository(Ticket);

  await ticketRepository.save({
    id: randomUUID(),
    title: 'ticket-title',
    description: 'Description of the ticket',
    status: Status.Open,
    priority: Priority.Low,
    category: Category.Support,
    createdBy: user || null,
    ...overrides,
  });
}
