import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source';
import { User } from '../../users/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Role } from '../../users/enums/role.enum';
import { Status } from '../../tickets/enums/status.enum';
import { Priority } from '../../tickets/enums/priority.enum';
import { Category } from '../../tickets/enums/category.enum';

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const userRepository = AppDataSource.getRepository(User);
  const ticketRepository = AppDataSource.getRepository(Ticket);
  const commentRepository = AppDataSource.getRepository(Comment);

  // -------------------------------------------------------
  // Users
  // -------------------------------------------------------

  const salt = await bcrypt.genSalt();

  const admin = userRepository.create({
    name: 'Admin User',
    email: 'admin@ticketsystem.com',
    passwordHash: await bcrypt.hash('Admin@1234', salt),
    role: Role.Admin,
  });

  const agent = userRepository.create({
    name: 'Support Agent',
    email: 'agent@ticketsystem.com',
    passwordHash: await bcrypt.hash('Agent@1234', salt),
    role: Role.Agent,
  });

  const user = userRepository.create({
    name: 'John Doe',
    email: 'john@ticketsystem.com',
    passwordHash: await bcrypt.hash('User@1234', salt),
    role: Role.User,
  });

  await userRepository.save([admin, agent, user]);
  console.log('Users created');

  // -------------------------------------------------------
  // Tickets
  // -------------------------------------------------------

  const ticket1 = ticketRepository.create({
    title: 'Login page not loading',
    description:
      'The login page returns a 500 error when accessing from mobile devices.',
    status: Status.Open,
    priority: Priority.High,
    category: Category.Bug,
    createdBy: user,
  });

  const ticket2 = ticketRepository.create({
    title: 'Add dark mode support',
    description:
      'It would be great to have a dark mode option in the user settings.',
    status: Status.In_progress,
    priority: Priority.Medium,
    category: Category.Feature_request,
    createdBy: user,
    assignedTo: agent,
  });

  const ticket3 = ticketRepository.create({
    title: 'Export tickets to CSV',
    description:
      'As an admin, I need to export all tickets to a CSV file for reporting.',
    status: Status.Open,
    priority: Priority.Low,
    category: Category.Improvement,
    createdBy: admin,
  });

  const ticket4 = ticketRepository.create({
    title: 'Password reset not working',
    description:
      'Users report that the password reset email is not being received.',
    status: Status.Resolved,
    priority: Priority.High,
    category: Category.Support,
    createdBy: user,
    assignedTo: agent,
  });

  await ticketRepository.save([ticket1, ticket2, ticket3, ticket4]);
  console.log('Tickets created');

  // -------------------------------------------------------
  // Comments
  // -------------------------------------------------------

  const comments = commentRepository.create([
    {
      content: 'I can confirm this issue. It happens on both iOS and Android.',
      ticket: ticket1,
      author: user,
    },
    {
      content:
        'We are investigating the issue. Can you share your device model and OS version?',
      ticket: ticket1,
      author: agent,
    },
    {
      content: 'iPhone 14, iOS 17.2.',
      ticket: ticket1,
      author: user,
    },
    {
      content: 'Working on this. Will update by end of day.',
      ticket: ticket2,
      author: agent,
    },
    {
      content: 'The reset email is going to spam folders. Please check there.',
      ticket: ticket4,
      author: agent,
    },
    {
      content: 'Found it in spam, thank you!',
      ticket: ticket4,
      author: user,
    },
  ]);

  await commentRepository.save(comments);
  console.log('Comments created');

  await AppDataSource.destroy();
  console.log('Seed completed successfully');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
