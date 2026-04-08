import { forwardRef, Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketService } from './tickets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), forwardRef(() => UsersModule)],
  controllers: [TicketsController],
  providers: [TicketService],
})
export class TicketsModule {}
